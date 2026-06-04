document.body.innerHTML = `
  <canvas id="blob-canvas"></canvas>
  <div id="empty-state"></div>
  <button id="empty-cta"></button>
  <button id="add-btn"></button>
  <nav id="breadcrumb"></nav>
  <dialog id="task-modal"></dialog>
  <h2 id="modal-title"></h2>
  <form id="task-form"></form>
  <input id="f-title">
  <textarea id="f-notes"></textarea>
  <input id="f-weight">
  <input id="f-deadline">
  <span id="weight-display"></span>
  <span id="f-title-err"></span>
  <button id="btn-delete"></button>
  <button id="btn-submit"></button>
  <button id="btn-cancel"></button>
  <dialog id="history-modal"></dialog>
  <div id="history-list"></div>
  <button id="history-btn"></button>
  <button id="btn-history-close"></button>
  <button id="btn-history-done"></button>
  <button id="btn-history-clear"></button>
`;
window.matchMedia = window.matchMedia || function() {
    return { matches: false, addEventListener: function() {} };
};
HTMLCanvasElement.prototype.getContext = () => ({
  canvas: { width: 800, height: 600 },
  clearRect: jest.fn(),
  save: jest.fn(),
  translate: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  fill: jest.fn(),
  restore: jest.fn()
});

let syncStorage = {};
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, cb) => {
        if (Array.isArray(keys)) {
          const res = {};
          keys.forEach(k => {
            if (syncStorage[k] !== undefined) res[k] = syncStorage[k];
          });
          cb(res);
        } else if (typeof keys === 'string') {
          const res = {};
          if (syncStorage[keys] !== undefined) res[keys] = syncStorage[keys];
          cb(res);
        } else if (keys === null) {
          cb(syncStorage);
        } else {
          cb({});
        }
      }),
      set: jest.fn((data, cb) => {
        Object.assign(syncStorage, data);
        if (cb) cb();
      }),
      remove: jest.fn((keys, cb) => {
        if (Array.isArray(keys)) {
          keys.forEach(k => delete syncStorage[k]);
        } else {
          delete syncStorage[keys];
        }
        if (cb) cb();
      })
    },
    onChanged: {
      addListener: jest.fn(fn => global.chrome.storage.onChanged.listeners.push(fn)),
      listeners: [],
      trigger(changes, namespace) {
        this.listeners.forEach(fn => fn(changes, namespace));
      }
    },
    local: {
      get: jest.fn((keys, cb) => cb({})),
      set: jest.fn((data, cb) => { if (cb) cb(); }),
      remove: jest.fn((keys, cb) => { if (cb) cb(); })
    }
  }
};

const { TaskStore } = require('../app.js');

describe('TaskStore - Chrome Sync Storage Split Keys', () => {
  beforeEach(async () => {
    syncStorage = {};
    jest.clearAllMocks();

    if (!global.crypto) global.crypto = {};
    global.crypto.randomUUID = () => 'test-id-' + Math.random().toString(36).substring(2, 9);
    
    // Clear tasks memory
    syncStorage['blob-todo-meta-tasks'] = [];
    await TaskStore.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save new tasks as separate keys in chrome.storage.sync', async () => {
    // Act
    const task = TaskStore.add({ title: 'New Sync Task' });
    
    // Assert
    expect(global.chrome.storage.sync.set).toHaveBeenCalled();
    expect(syncStorage['blob-todo-meta-tasks']).toContain(task.id);
    expect(syncStorage[`blob-todo-task-${task.id}`]).toEqual(expect.objectContaining({
      title: 'New Sync Task',
      id: task.id
    }));
  });

  it('should load tasks from separate keys in chrome.storage.sync', async () => {
    // Arrange
    syncStorage['blob-todo-meta-tasks'] = ['task-999'];
    syncStorage['blob-todo-task-task-999'] = { id: 'task-999', title: 'Loaded Task', weight: 4 };

    // Act
    await TaskStore.init();
    const tasks = TaskStore.getTopLevel();

    // Assert
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Loaded Task');
    expect(tasks[0].weight).toBe(4);
  });

  it('should migrate data from localStorage if sync is empty', async () => {
    // Arrange: sync is empty (undefined)
    delete syncStorage['blob-todo-meta-tasks'];
    
    // Arrange: localStorage has legacy data
    const legacyTasks = [{ id: 'legacy-1', title: 'Legacy Task', weight: 5 }];
    localStorage.setItem('blob-todo-tasks', JSON.stringify(legacyTasks));

    // Act
    await TaskStore.init();
    const tasks = TaskStore.getTopLevel();

    // Assert: should load the legacy task
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Legacy Task');

    // Assert: should have saved the legacy task to sync storage
    expect(global.chrome.storage.sync.set).toHaveBeenCalled();
    expect(syncStorage['blob-todo-meta-tasks']).toContain('legacy-1');
    expect(syncStorage['blob-todo-task-legacy-1']).toBeDefined();
    
    // Assert: should clear the legacy localStorage to avoid re-migration
    expect(localStorage.getItem('blob-todo-tasks')).toBeNull();
  });

  it('should reload tasks and emit event when chrome.storage.onChanged is triggered', async () => {
    // Arrange: Event listener should be set up during init
    await TaskStore.init();
    
    // Prepare external change
    syncStorage['blob-todo-meta-tasks'] = ['ext-1'];
    syncStorage['blob-todo-task-ext-1'] = { id: 'ext-1', title: 'External Task', weight: 10 };
    
    // Mock event listener
    const onTasksChanged = jest.fn();
    const { EventBus } = require('../app.js');
    EventBus.on('tasks:changed', onTasksChanged);

    // Act: Trigger onChanged
    global.chrome.storage.onChanged.trigger({
      'blob-todo-meta-tasks': { newValue: ['ext-1'] }
    }, 'sync');

    // Wait for async load to finish
    await new Promise(r => setTimeout(r, 10));

    // Assert: TaskStore should have new tasks and EventBus should emit
    const tasks = TaskStore.getTopLevel();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('External Task');
    expect(onTasksChanged).toHaveBeenCalled();
  });
});
