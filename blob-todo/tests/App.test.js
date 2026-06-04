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
  <div id="quota-warning" hidden>同步空間即將額滿，請刪除已完成或不需要的任務以繼續跨裝置同步</div>
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

const { App, TaskStore } = require('../app.js');

describe('App - UI Warning Mechanism', () => {
  beforeEach(async () => {
    // mock TaskStore.getAll() to return 401 items
    TaskStore.getAll = jest.fn(() => new Array(401).fill({}));
    // reset hidden state
    document.getElementById('quota-warning').hidden = true;
  });

  it('should show quota warning if total tasks exceed 400', () => {
    App.refresh();
    const warningEl = document.getElementById('quota-warning');
    expect(warningEl.hidden).toBe(false);
  });

  it('should hide quota warning if total tasks are 400 or less', () => {
    TaskStore.getAll = jest.fn(() => new Array(400).fill({}));
    App.refresh();
    const warningEl = document.getElementById('quota-warning');
    expect(warningEl.hidden).toBe(true);
  });
});
