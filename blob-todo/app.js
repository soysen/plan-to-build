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
  // 計算距今天數（負數 = 已過期）
  getDaysLeft(deadline) {
    if (!deadline) return null;
    const [y, m, d] = deadline.split('-').map(Number);
    const dl = new Date(y, m - 1, d);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.ceil((dl - today) / 86400000);
  },
  // Urgency Boost：7天內線性加成 0→1.5 的 weight bonus
  getUrgencyBonus(deadline) {
    const days = this.getDaysLeft(deadline);
    if (days === null || days > 7) return 0;
    const clamped = Math.max(0, Math.min(7, days));
    return 1.5 * (1 - clamped / 7);
  },
  // 連續漸變顏色：深紅（過期）→ 橘紅 → 橘 → 黃 → 綠，並隨期限接近增加不透明度
  getColor(deadline, hue) {
    const days = this.getDaysLeft(deadline);
    // 計算不透明度：無期限或遠期為 0.65，14天內線性增加至 1.0
    let alpha = 0.65;
    if (days !== null) {
      if (days <= 0) alpha = 1.0;
      else if (days <= 14) alpha = 0.65 + (1 - days / 14) * 0.35;
    }

    if (days !== null && days <= 14) {
      // 色相：0(紅) → 25(橘) → 45(黃) → 120(綠)
      const h = days <= 0 ? 0
              : days <= 3 ? (days / 3) * 25
              : days <= 7 ? 25 + ((days - 3) / 4) * 20
              : 45 + ((days - 7) / 7) * 75;
      // 飽和度：過期最高，越遠越低
      const s = days <= 0 ? 100 : Math.max(55, 95 - days * 3);
      // 亮度：過期偏暗(55%)，越遠越亮(75%)
      const l = days <= 0 ? 55  : Math.min(75, 58 + days * 1.5);
      return `hsla(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%,${alpha.toFixed(2)})`;
    }
    const targetHue = hue != null ? hue : 220;
    const targetSat = hue != null ? 45 : 15;
    const targetLum = hue != null ? 75 : 85;
    return `hsla(${targetHue},${targetSat}%,${targetLum}%,${alpha.toFixed(2)})`;
  }
};

// ── MOD-001 TaskStore ─────────────────────────────────────────────
const SHAPES = [
  '40% 60% 70% 30% / 40% 50% 60% 50%',
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '70% 30% 50% 50% / 30% 60% 40% 70%',
  '30% 70% 70% 30% / 50% 40% 60% 50%',
  '50% 50% 30% 70% / 70% 40% 60% 30%',
  '40% 60% 50% 50% / 30% 70% 30% 70%',
  '60% 40% 60% 40% / 40% 60% 40% 60%',
  '30% 70% 40% 60% / 60% 30% 70% 40%'
];

// Inject dynamic wobble animations
const shapeStyles = document.createElement('style');
// 產生 20 組平滑的變形動畫 (Lava Lamp 風格)
shapeStyles.innerHTML = Array.from({ length: 20 }).map((_, i) => {
  // 縮小範圍至 40-60% 避免邊緣被拉直產生的「邊界感」
  const r = () => Math.floor(40 + Math.random() * 20); 
  const genShape = () => `${r()}% ${100-r()}% ${r()}% ${100-r()}% / ${r()}% ${r()}% ${100-r()}% ${100-r()}%`;
  return `
    @keyframes wobble-${i} {
      0%, 100% { border-radius: ${genShape()}; }
      25% { border-radius: ${genShape()}; }
      50% { border-radius: ${genShape()}; }
      75% { border-radius: ${genShape()}; }
    }
  `;
}).join('\n');
document.head.appendChild(shapeStyles);

const TaskStore = (() => {
  const KEY = 'blob-todo-tasks';
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
        done: false, blobShapeId: Math.floor(Math.random() * SHAPES.length),
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
      // 有效 weight = 原始 weight + urgency bonus（deadline 越近加越多，上限 +1.5）
      r: Math.max(44, baseR * Math.sqrt(((t.weight || 3) + ColorEngine.getUrgencyBonus(t.deadline)) / 3))
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
    canvas.querySelectorAll('.blob-wrapper').forEach(el => {
      if (!tasks.find(t => t.id === el.dataset.id)) el.remove();
    });
    
    tasks.forEach(task => {
      const L = layouts.find(l => l.id === task.id);
      if (!L) return;
      let wrapper = canvas.querySelector(`.blob-wrapper[data-id="${task.id}"]`);
      let el;
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'blob-wrapper'; wrapper.dataset.id = task.id;
        el = document.createElement('div');
        el.className = 'blob';
        el.innerHTML = `
          <span class="blob-done-mark">✓</span>
          <span class="blob-title"></span>
          <span class="blob-hint"></span>
          <button class="blob-check" aria-label="標記完成">✓</button>`;
        wrapper.appendChild(el);
        canvas.appendChild(wrapper);
        
        let startX = 0, startY = 0, isDragging = false;
        
        el.addEventListener('pointerdown', e => {
          if (e.target.closest('.blob-check')) return;
          isDragging = false;
          startX = e.clientX; startY = e.clientY;
          el.setPointerCapture(e.pointerId);
          wrapper.style.zIndex = 1000;
          wrapper.style.transition = 'none';
        });

        el.addEventListener('pointermove', e => {
          if (el.hasPointerCapture(e.pointerId)) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (dx*dx + dy*dy > 25) isDragging = true;
            if (isDragging) {
              const currentLeft = parseFloat(wrapper.style.left);
              const currentTop = parseFloat(wrapper.style.top);
              wrapper.style.left = `${currentLeft + e.movementX}px`;
              wrapper.style.top = `${currentTop + e.movementY}px`;
            }
          }
        });

        el.addEventListener('pointerup', e => {
          if (el.hasPointerCapture(e.pointerId)) {
            el.releasePointerCapture(e.pointerId);
            wrapper.style.zIndex = '';
            wrapper.style.transition = '';
          }
        });

        // 邊緣變形互動
        el.addEventListener('mousemove', e => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const px = (e.clientX - centerX) / (rect.width / 2);
          const py = (e.clientY - centerY) / (rect.height / 2);
          el.style.setProperty('--mx', px.toFixed(2));
          el.style.setProperty('--my', py.toFixed(2));
        });

        el.addEventListener('mouseleave', () => {
          el.style.setProperty('--mx', '0');
          el.style.setProperty('--my', '0');
        });

        el.addEventListener('click', e => {
          if (isDragging || e.target.closest('.blob-check')) return;
          const t = TaskStore.getById(task.id);
          if (t.done) {
            // 停止所有動態效果，確保破裂動畫可見
            wrapper.style.animation = 'none';
            el.style.animation = 'none';
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
      } else {
        el = wrapper.querySelector('.blob');
      }

      const color = task.done ? null : ColorEngine.getColor(task.deadline, task.colorHue);
      const fontSize = task.weight || 1;
      
      // Extract numeric shape ID or use a hash of the task ID as fallback for existing tasks
      let shapeId = task.blobShapeId;
      if (typeof shapeId !== 'number') {
        const hash = String(task.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        shapeId = hash % 20;
      } else {
        shapeId = shapeId % 20;
      }
      
      const shapeStr = SHAPES[shapeId % SHAPES.length];
      const duration = 8 + (shapeId % 6);
      const delay = -(shapeId * 3.1);
      
      // Wrapper 處理位置與慢速漂浮
      wrapper.style.left = `${L.x - L.r}px`;
      wrapper.style.top = `${L.y - L.r}px`;
      wrapper.style.width = `${L.r*2}px`;
      wrapper.style.height = `${L.r*2}px`;
      wrapper.style.setProperty('--float-dur', `${10 + (shapeId % 5) * 2}s`);
      wrapper.style.setProperty('--float-delay', `${-(shapeId * 1.5)}s`);

      // Inner element 處理形狀與 3D 互動
      el.style.cssText = `
        width: 100%; height: 100%;
        font-size:${fontSize}rem;
        --shape:${shapeStr};
        animation: wobble-${shapeId} ${duration}s ease-in-out ${delay}s infinite alternate;
        ${color ? `--blobColor:${color};` : ''}
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
