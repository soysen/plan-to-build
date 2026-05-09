// ── MOD-007 EventBus ──────────────────────────────────────────────
const EventBus = (() => {
  const h = {};
  return {
    on(e, fn)  { (h[e] ??= []).push(fn) },
    off(e, fn) { h[e] = (h[e] || []).filter(f => f !== fn) },
    emit(e, d) { (h[e] || []).forEach(fn => fn(d)) }
  };
})();

// ── MOD-002 ColorEngine ───────────────────────────────────────────
const HUES = [195, 168, 258, 316, 32, 280, 145, 210];
const ColorEngine = {
  getColor(deadline, hue) {
    if (deadline) {
      const [y,m,d] = deadline.split('-').map(Number);
      const dl = new Date(y, m-1, d);
      const today = new Date(); today.setHours(0,0,0,0);
      const days = Math.ceil((dl - today) / 86400000);
      if (days <= 1) return 'hsl(0,95%,65%)';
      if (days <= 3) return 'hsl(25,85%,75%)';
      if (days <= 7) return 'hsl(45,70%,80%)';
    }
    return hue != null ? `hsl(${hue},45%,75%)` : 'hsl(220,15%,85%)';
  }
};

// ── MOD-001 TaskStore ─────────────────────────────────────────────
const TaskStore = (() => {
  const KEY = 'blob-todo-tasks';
  const SHAPES = [
    '52% 48% 46% 54% / 50% 55% 45% 50%',
    '47% 53% 54% 46% / 51% 45% 55% 49%',
    '55% 45% 49% 51% / 48% 52% 48% 52%',
    '45% 55% 52% 48% / 54% 47% 53% 46%',
    '51% 49% 47% 53% / 46% 51% 49% 54%',
    '50% 50% 55% 45% / 53% 48% 52% 47%',
    '48% 52% 45% 55% / 47% 54% 46% 53%',
    '53% 47% 51% 49% / 52% 49% 51% 48%'
  ];
  let tasks = [];
  
  const load = async () => {
    // try chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise(resolve => {
        chrome.storage.local.get([KEY], result => {
          tasks = result[KEY] || [];
          if (!Array.isArray(tasks)) tasks = [];
          resolve();
        });
      });
    } else {
      // fallback to localStorage
      try { tasks = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { tasks = []; }
      if (!Array.isArray(tasks)) tasks = [];
      return Promise.resolve();
    }
  };
  
  const save = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [KEY]: tasks });
    } else {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    }
  };
  
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];
  
  return {
    async init() { await load(); },
    getTopLevel()       { return tasks.filter(t => !t.parentId); },
    getChildren(pid)    { return tasks.filter(t => t.parentId === pid); },
    getById(id)         { return tasks.find(t => t.id === id); },
    getNextHint(pid)    {
      const c = tasks.filter(t => t.parentId === pid && !t.done);
      return c.length ? c.sort((a,b) => a.createdAt > b.createdAt ? -1 : 1)[0].title : null;
    },
    add(data) {
      const hue = HUES[tasks.filter(t=>!t.parentId).length % HUES.length];
      const t = {
        id: crypto.randomUUID(), title: data.title.trim(),
        weight: data.weight ?? 3, deadline: data.deadline || null,
        done: false, blobShape: rand(SHAPES),
        colorHue: data.parentId ? null : hue,
        parentId: data.parentId || null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      tasks.push(t); save(); EventBus.emit('tasks:changed'); return t;
    },
    update(id, partial) {
      const i = tasks.findIndex(t => t.id === id);
      if (i < 0) return;
      tasks[i] = { ...tasks[i], ...partial, updatedAt: new Date().toISOString() };
      save(); EventBus.emit('tasks:changed'); return tasks[i];
    },
    delete(id) {
      tasks = tasks.filter(t => t.id !== id && t.parentId !== id);
      save(); EventBus.emit('tasks:changed');
    },
    toggleDone(id) { return this.update(id, { done: !this.getById(id)?.done }); }
  };
})();

// ── MOD-003 LayoutEngine ──────────────────────────────────────────
const LayoutEngine = {
  calculate(items, vw, vh) {
    if (!items.length) return [];
    const pad = 20, n = items.length;
    const totalArea = vw * vh * 0.55;
    const avgR = Math.sqrt(totalArea / (n * Math.PI));
    const baseR = Math.min(avgR, Math.min(vw, vh) * 0.22);
    const blobs = items.map(t => ({
      id: t.id,
      r: Math.max(44, baseR * Math.sqrt((t.weight || 3) / 3))
    }));

    // 若視窗太小導致泡泡總面積太大會造成重疊，則依比例縮小（擠壓效果）
    const maxAllowedArea = (vw - pad * 2) * (vh - pad * 2) * 0.65;
    const currentTotalArea = blobs.reduce((sum, b) => sum + Math.PI * b.r * b.r, 0);
    if (currentTotalArea > maxAllowedArea) {
      const scaleFactor = Math.sqrt(maxAllowedArea / currentTotalArea);
      blobs.forEach(b => b.r *= scaleFactor);
    }
    // Fibonacci spiral placement
    const golden = Math.PI * (3 - Math.sqrt(5));
    blobs.forEach((b, i) => {
      const angle = i * golden;
      const radius = Math.sqrt(i / n) * Math.min(vw, vh) * 0.38;
      b.x = vw / 2 + radius * Math.cos(angle);
      b.y = vh / 2 + radius * Math.sin(angle);
    });
    // Repulsion iterations
    for (let iter = 0; iter < 60; iter++) {
      for (let a = 0; a < blobs.length; a++) {
        for (let b2 = a + 1; b2 < blobs.length; b2++) {
          const A = blobs[a], B = blobs[b2];
          const dx = B.x - A.x, dy = B.y - A.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const minD = A.r + B.r + 8;
          if (dist < minD) {
            const push = (minD - dist) / 2;
            const nx = dx / dist, ny = dy / dist;
            A.x -= nx * push; A.y -= ny * push;
            B.x += nx * push; B.y += ny * push;
          }
        }
        // Boundary
        const bl = blobs[a];
        bl.x = Math.max(bl.r + pad, Math.min(vw - bl.r - pad, bl.x));
        bl.y = Math.max(bl.r + pad, Math.min(vh - bl.r - pad, bl.y));
      }
    }
    return blobs;
  }
};

// ── MOD-004 BlobRenderer ──────────────────────────────────────────
const BlobRenderer = {
  render(tasks, canvas, vw, vh) {
    const layouts = LayoutEngine.calculate(tasks, vw, vh);
    // Remove stale
    canvas.querySelectorAll('.blob').forEach(el => {
      if (!tasks.find(t => t.id === el.dataset.id)) el.remove();
    });
    layouts.forEach((L, i) => {
      const task = tasks.find(t => t.id === L.id); if (!task) return;
      let el = canvas.querySelector(`.blob[data-id="${task.id}"]`);
      const isNew = !el;
      if (isNew) {
        el = document.createElement('div');
        el.className = 'blob'; el.dataset.id = task.id;
        el.innerHTML = `
          <span class="blob-done-mark">✓</span>
          <span class="blob-title"></span>
          <span class="blob-hint"></span>
          <button class="blob-check" aria-label="標記完成">✓</button>`;
        el.addEventListener('click', e => {
          if (e.target.closest('.blob-check')) return;
          const t = TaskStore.getById(task.id);
          if (t.done) {
            el.classList.add('popping');
            setTimeout(() => TaskStore.delete(task.id), 300);
            return;
          }
          const children = TaskStore.getChildren(task.id);
          if (children.length) SubtaskView.enter(t);
          else ModalManager.openEdit(task.id);
        });
        el.querySelector('.blob-check').addEventListener('click', e => {
          e.stopPropagation(); TaskStore.toggleDone(task.id);
        });
        el.addEventListener('contextmenu', e => { e.preventDefault(); ModalManager.openEdit(task.id); });
        canvas.appendChild(el);
      }
      const color = task.done ? null : ColorEngine.getColor(task.deadline, task.colorHue);
      const fontSize = task.weight || 1;
      el.style.cssText = `
        width:${L.r*2}px;height:${L.r*2}px;
        left:${L.x - L.r}px;top:${L.y - L.r}px;
        font-size:${fontSize}rem;
        --shape:${task.blobShape};${color ? `--blobColor:${color};` : ''}
      `;
      el.classList.toggle('done', task.done);
      el.querySelector('.blob-title').textContent = task.title;
      const hint = TaskStore.getNextHint(task.id);
      const hintEl = el.querySelector('.blob-hint');
      hintEl.textContent = hint ? `▸ ${hint}` : '';
      hintEl.hidden = !hint;
    });
  }
};

// ── MOD-005 ModalManager ──────────────────────────────────────────
const ModalManager = (() => {
  const dialog = document.getElementById('task-modal');
  const title  = document.getElementById('modal-title');
  const fTitle = document.getElementById('f-title');
  const fWeight= document.getElementById('f-weight');
  const fDeadline = document.getElementById('f-deadline');
  const wDisp  = document.getElementById('weight-display');
  const errEl  = document.getElementById('f-title-err');
  const btnDel = document.getElementById('btn-delete');
  const btnSub = document.getElementById('btn-submit');
  let mode = 'add', editId = null, parentId = null;

  fWeight.addEventListener('input', () => wDisp.textContent = fWeight.value);
  document.getElementById('btn-cancel').addEventListener('click', () => close());
  dialog.addEventListener('close', () => reset());

  function reset() { fTitle.value=''; fWeight.value=3; wDisp.textContent='3'; fDeadline.value=''; errEl.textContent=''; }
  function close() { dialog.close(); reset(); }

  document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const t = fTitle.value.trim();
    if (!t) { errEl.textContent = '請輸入任務名稱'; fTitle.focus(); return; }
    errEl.textContent = '';
    if (mode === 'add') TaskStore.add({ title: t, weight: +fWeight.value, deadline: fDeadline.value || null, parentId });
    else TaskStore.update(editId, { title: t, weight: +fWeight.value, deadline: fDeadline.value || null });
    close();
  });

  btnDel.addEventListener('click', () => {
    if (!confirm('確定要刪除這個任務？')) return;
    TaskStore.delete(editId); close();
  });

  return {
    openAdd(pid = null) {
      mode = 'add'; editId = null; parentId = pid;
      title.textContent = pid ? '新增子任務' : '新增任務';
      btnDel.hidden = true; btnSub.textContent = '新增';
      dialog.showModal(); fTitle.focus();
    },
    openEdit(id) {
      const task = TaskStore.getById(id); if (!task) return;
      mode = 'edit'; editId = id; parentId = null;
      title.textContent = '編輯任務';
      fTitle.value = task.title; fWeight.value = task.weight; wDisp.textContent = task.weight;
      fDeadline.value = task.deadline || '';
      btnDel.hidden = false; btnSub.textContent = '儲存';
      dialog.showModal(); fTitle.focus();
    }
  };
})();

// ── MOD-006 SubtaskView ───────────────────────────────────────────
const SubtaskView = (() => {
  let parentTask = null;
  const breadcrumb = document.getElementById('breadcrumb');
  const addBtn = document.getElementById('add-btn');

  function renderBreadcrumb() {
    if (!parentTask) {
      breadcrumb.innerHTML = '';
    } else {
      breadcrumb.innerHTML = `
        <span class="crumb" id="bc-home" role="button" tabindex="0">所有任務</span>
        <span class="sep">›</span>
        <span class="current">${parentTask.title}</span>`;
      document.getElementById('bc-home').addEventListener('click', () => SubtaskView.exit());
    }
  }

  addBtn.addEventListener('click', () => ModalManager.openAdd(parentTask?.id || null));

  return {
    enter(task) { parentTask = task; renderBreadcrumb(); App.refresh(); },
    exit()      { parentTask = null; renderBreadcrumb(); App.refresh(); },
    getParent() { return parentTask; }
  };
})();

// ── Main App ──────────────────────────────────────────────────────
const App = {
  canvas: document.getElementById('blob-canvas'),
  emptyState: document.getElementById('empty-state'),

  refresh() {
    const parent = SubtaskView.getParent();
    const tasks = parent ? TaskStore.getChildren(parent.id) : TaskStore.getTopLevel();
    const vw = this.canvas.clientWidth, vh = this.canvas.clientHeight;
    const isEmpty = tasks.length === 0;
    this.emptyState.hidden = !isEmpty;
    document.getElementById('add-btn').style.display = isEmpty ? 'none' : 'flex';
    if (isEmpty) return;
    BlobRenderer.render(tasks, this.canvas, vw, vh);
  },

  async init() {
    await TaskStore.init();
    EventBus.on('tasks:changed', () => this.refresh());
    document.getElementById('empty-cta').addEventListener('click', () => ModalManager.openAdd());
    
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.refresh(), 100);
    });
    ro.observe(this.canvas);
    
    // 深色模式補強偵測
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => document.documentElement.classList.toggle('dark-mode', darkQuery.matches);
    darkQuery.addEventListener('change', updateTheme);
    updateTheme();

    this.refresh();
  }
};

App.init();
