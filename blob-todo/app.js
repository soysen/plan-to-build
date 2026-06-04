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
    // try chrome storage sync
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise(resolve => {
        chrome.storage.sync.get(['blob-todo-meta-tasks'], result => {
          const meta = result['blob-todo-meta-tasks'] || [];
          if (!Array.isArray(meta) || meta.length === 0) {
            tasks = [];
            resolve();
            return;
          }
          const keysToFetch = meta.map(id => `blob-todo-task-${id}`);
          chrome.storage.sync.get(keysToFetch, taskResults => {
            tasks = meta.map(id => taskResults[`blob-todo-task-${id}`]).filter(Boolean);
            resolve();
          });
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
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      const meta = tasks.map(t => t.id);
      const dataToSave = { 'blob-todo-meta-tasks': meta };
      tasks.forEach(t => {
        dataToSave[`blob-todo-task-${t.id}`] = t;
      });
      chrome.storage.sync.set(dataToSave);
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
      // Golden ratio based hue distribution for better variety
      const goldenRatioConjugate = 0.618033988749895;
      let hueSeed = tasks.filter(t => !t.parentId).length;
      const hue = (Math.random() * 360 + hueSeed * goldenRatioConjugate * 360) % 360;
      
      const t = {
        id: crypto.randomUUID(), title: data.title.trim(),
        notes: data.notes || '',
        weight: data.weight ?? 3, deadline: data.deadline || null,
        done: false, blobShapeId: Math.floor(Math.random() * SHAPES.length),
        colorHue: data.parentId ? null : hue,
        parentId: data.parentId || null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      tasks.push(t); save(); EventBus.emit('tasks:changed'); return t;
    },
    delete(id) {
      const toDelete = tasks.find(t => t.id === id);
      if (toDelete) {
        const history = JSON.parse(localStorage.getItem('blob_todo_history') || '[]');
        history.unshift({ ...toDelete, deletedAt: new Date().toISOString() });
        localStorage.setItem('blob_todo_history', JSON.stringify(history.slice(0, 50))); // Keep last 50
      }
      const childrenIds = tasks.filter(t => t.parentId === id).map(t => t.id);
      tasks = tasks.filter(t => t.id !== id && t.parentId !== id);
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const keysToRemove = [`blob-todo-task-${id}`, ...childrenIds.map(cid => `blob-todo-task-${cid}`)];
        chrome.storage.sync.remove(keysToRemove);
      }
      
      save(); EventBus.emit('tasks:changed');
    },
    update(id, partial) {
      const i = tasks.findIndex(t => t.id === id);
      if (i < 0) return;
      tasks[i] = { ...tasks[i], ...partial, updatedAt: new Date().toISOString() };
      save(); EventBus.emit('tasks:changed'); return tasks[i];
    },
    toggleDone(id) { return this.update(id, { done: !this.getById(id)?.done }); },
    getDeleted() { return JSON.parse(localStorage.getItem('blob_todo_history') || '[]'); },
    restore(id) {
      const history = this.getDeleted();
      const task = history.find(t => t.id === id);
      if (task) {
        // Reset state to uncompleted upon restoration
        const restoredTask = { 
          ...task, 
          done: false, 
          updatedAt: new Date().toISOString() 
        };
        tasks.push(restoredTask);
        localStorage.setItem('blob_todo_history', JSON.stringify(history.filter(t => t.id !== id)));
        save(); EventBus.emit('tasks:changed');
      }
    },
    clearHistory() {
      localStorage.setItem('blob_todo_history', '[]');
      EventBus.emit('tasks:changed');
    }
  };
})();

// ── MOD-003 PhysicsEngine (Spring-Physics) ───────────────────────
const PhysicsEngine = (() => {
  let blobs = [];
  const DAMPING = 0.95;    // Balanced fluid feel
  const DRIFT = 0.025;     // Stronger drift
  const ITERATIONS = 5;
  
  return {
    sync(tasks, vw, vh) {
      const activeIds = tasks.map(t => t.id);
      blobs = blobs.filter(b => activeIds.includes(b.id));
      
      const baseR = Math.min(vw, vh) * 0.07;
      
      tasks.forEach(task => {
        const existing = blobs.find(b => b.id === task.id);
        const r = baseR * Math.sqrt(Math.pow(task.weight || 3, 1.7));
        
        if (!existing) {
          // Add new blob
          blobs.push({
            id: task.id,
            x: vw / 2, y: vh / 2,
            vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
            ax: 0, ay: 0,
            r: r, targetR: r,
            color: ColorEngine.getColor(task.deadline, task.colorHue),
            done: task.done,
            compression: 0,
            popProgress: 0, // 0 to 1 for pop animation
            isPopping: false,
            // Individual movement seeds
            wanderAngle: Math.random() * Math.PI * 2,
            wanderSpeed: 0.005 + Math.random() * 0.02,
            points: Array.from({length: 8}, (_, i) => ({
              angle: (i / 8) * Math.PI * 2,
              offset: 0,
              v: 0
            }))
          });
        } else {
          // Update existing blob state
          existing.targetR = r;
          existing.done = task.done;
          existing.color = ColorEngine.getColor(task.deadline, task.colorHue);
        }
      });
    },
    update(vw, vh, mousePos) {
      // 1. Update Positions (Smooth Linear Flow)
      const time = Date.now() * 0.0005;
      blobs.forEach((b, i) => {
        // Individualized organic drift
        b.wanderAngle += b.wanderSpeed;
        b.vx += Math.cos(b.wanderAngle) * DRIFT;
        b.vy += Math.sin(b.wanderAngle) * DRIFT;
        
        // Add a tiny bit of random jitter for extra slime feel
        b.vx += (Math.random() - 0.5) * 0.01;
        b.vy += (Math.random() - 0.5) * 0.01;
        
        b.x += b.vx; b.y += b.vy;
        b.vx *= DAMPING; b.vy *= DAMPING;
      });

      // 2. Verlet Relaxation (Constraint Resolution)
      for (let step = 0; step < ITERATIONS; step++) {
        for (let i = 0; i < blobs.length; i++) {
          for (let j = i + 1; j < blobs.length; j++) {
            const b1 = blobs[i], b2 = blobs[j];
            const dx = b2.x - b1.x, dy = b2.y - b1.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const minDist = b1.r + b2.r + 15;
            
            if (dist < minDist) {
              const overlap = (minDist - dist);
              const nx = dx / dist, ny = dy / dist;
              const push = overlap * 0.5;
              b1.x -= nx * push; b1.y -= ny * push;
              b2.x += nx * push; b2.y += ny * push;
              
              const dot = (b1.vx - b2.vx) * nx + (b1.vy - b2.vy) * ny;
              b1.vx -= nx * dot * 0.2; b1.vy -= ny * dot * 0.2;
              b2.vx += nx * dot * 0.2; b2.vy += ny * dot * 0.2;

              // Deform vertices at collision angle
              const angle1 = Math.atan2(ny, nx);
              const angle2 = Math.atan2(-ny, -nx);
              b1.points.forEach(p => {
                const diff = Math.abs(Math.atan2(Math.sin(p.angle - angle1), Math.cos(p.angle - angle1)));
                if (diff < Math.PI / 3) p.v -= (Math.PI/3 - diff) * overlap * 0.2;
              });
              b2.points.forEach(p => {
                const diff = Math.abs(Math.atan2(Math.sin(p.angle - angle2), Math.cos(p.angle - angle2)));
                if (diff < Math.PI / 3) p.v -= (Math.PI/3 - diff) * overlap * 0.2;
              });
            }
          }
        }
        
        // Boundaries with Bounce
        blobs.forEach(b => {
          const pad = 25;
          if (b.x < b.r + pad) { b.x = b.r + pad; b.vx *= -1; }
          if (b.x > vw - b.r - pad) { b.x = vw - b.r - pad; b.vx *= -1; }
          if (b.y < b.r + pad) { b.y = b.r + pad; b.vy *= -1; }
          if (b.y > vh - b.r - pad) { b.y = vh - b.r - pad; b.vy *= -1; }
        });
      }

      // 3. Update Vertex Elasticity (Deep Slime Wobble)
      const wobbleTime = Date.now() * 0.0006; // Slower, more organic
      blobs.forEach((b, i) => {
        if (b.isPopping) {
          b.popProgress += 0.05;
          b.r *= 1.05; // Rapid expansion
          if (b.popProgress > 1) b.popProgress = 1;
        }

        b.points.forEach((p, pi) => {
          // Deep organic deformation: multiple waves combined
          const wave1 = Math.sin(wobbleTime * 1.5 + i + pi) * (b.r * 0.15);
          const wave2 = Math.cos(wobbleTime * 0.8 + i * 0.5 + pi * 2) * (b.r * 0.1);
          const naturalWobble = wave1 + wave2;
          
          const spring = (-p.offset + naturalWobble) * 0.05;
          p.v += spring;
          p.v *= 0.8; // High damping for heavy slime
          p.offset += p.v;
        });
      });
    },
    getBlobs() { return blobs; }
  };
})();

// ── MOD-004 CanvasRenderer ────────────────────────────────────────
const CanvasRenderer = {
  render(ctx, blobs) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const time = Date.now() * 0.0005;
    blobs.forEach((b, i) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      
      const baseColor = b.color.replace('hsla(', '').replace(')', '').split(',');
      // Draw with full opacity inside Canvas so the Gooey filter works correctly
      const alpha = b.isPopping ? (1 - b.popProgress) : 1;
      const fillColor = b.done ? `hsla(220, 10%, 92%, ${alpha})` : `hsla(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
      ctx.fillStyle = fillColor;
      
      if (b.isPopping) {
        ctx.filter = `blur(${b.popProgress * 20}px)`; // Dissolve effect
      }
      
      // Draw smooth path through vertices
      const pts = b.points.map(p => ({
        x: (b.r + p.offset) * Math.cos(p.angle),
        y: (b.r + p.offset) * Math.sin(p.angle)
      }));

      ctx.beginPath();
      ctx.moveTo((pts[0].x + pts[pts.length-1].x)/2, (pts[0].y + pts[pts.length-1].y)/2);
      
      for(let j=0; j<pts.length; j++) {
        const p1 = pts[j];
        const p2 = pts[(j+1) % pts.length];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }
      
      ctx.fill();
      ctx.restore();
    });
  }
};

// ── MOD-005 DOMOverlay ───────────────────────────────────────────
const DOMOverlay = {
  sync(tasks, blobs, container) {
    // Remove stale
    container.querySelectorAll('.blob-wrapper').forEach(el => {
      if (!tasks.find(t => t.id === el.dataset.id)) el.remove();
    });

    tasks.forEach(task => {
      const b = blobs.find(blob => blob.id === task.id);
      if (!b) return;

      let wrapper = container.querySelector(`.blob-wrapper[data-id="${task.id}"]`);
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'blob-wrapper';
        wrapper.dataset.id = task.id;
        wrapper.innerHTML = `
          <div class="blob">
            <span class="blob-done-mark">做完了</span>
            <span class="blob-title"></span>
            <span class="blob-hint"></span>
            <button class="blob-check" aria-label="標記完成">做完了</button>
          </div>`;
        container.appendChild(wrapper);
        
        const el = wrapper.querySelector('.blob');
        el.addEventListener('click', e => {
          if (e.target.closest('.blob-check')) return;
          const t = TaskStore.getById(task.id);
          if (t.done) {
            el.classList.add('popping');
            const b = PhysicsEngine.getBlobs().find(bl => bl.id === task.id);
            if (b) b.isPopping = true;
            setTimeout(() => TaskStore.delete(task.id), 400);
          } else {
            const children = TaskStore.getChildren(task.id);
            if (children.length) SubtaskView.enter(t);
            else ModalManager.openEdit(task.id);
          }
        });
        el.querySelector('.blob-check').addEventListener('click', e => {
          e.stopPropagation(); TaskStore.toggleDone(task.id);
        });
      }

      const el = wrapper.querySelector('.blob');
      const titleEl = el.querySelector('.blob-title');
      const hintEl = el.querySelector('.blob-hint');
      
      wrapper.style.transform = `translate(${b.x}px, ${b.y}px)`;
      
      // Dynamic Font Size based on Bubble Radius (Scaled down for Level 1/2)
      const baseSize = b.r / 68; 
      el.style.fontSize = `${baseSize}rem`;
      
      el.style.width = `${b.r * 2}px`;
      el.style.height = `${b.r * 2}px`;
      // No more left/top/margin - centered via CSS transform
      
      el.classList.toggle('done', task.done);
      titleEl.textContent = task.title;
      const notes = task.notes ? task.notes.trim() : '';
      hintEl.textContent = notes;
      hintEl.hidden = !notes;
    });
  }
};

// ── MOD-005 ModalManager ──────────────────────────────────────────
const ModalManager = (() => {
  const dialog = document.getElementById('task-modal');
  const title  = document.getElementById('modal-title');
  const fTitle = document.getElementById('f-title');
  const fNotes = document.getElementById('f-notes');
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

  function reset() { 
    fTitle.value=''; 
    fNotes.value='';
    fWeight.value=3; 
    wDisp.textContent='3'; 
    fDeadline.value=''; 
    errEl.textContent=''; 
  }
  function close() { dialog.close(); reset(); }

  document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const t = fTitle.value.trim();
    if (!t) { errEl.textContent = '請輸入任務名稱'; fTitle.focus(); return; }
    errEl.textContent = '';
    const data = { 
      title: t, 
      notes: fNotes.value.trim(),
      weight: +fWeight.value, 
      deadline: fDeadline.value || null, 
      parentId 
    };
    if (mode === 'add') TaskStore.add(data);
    else TaskStore.update(editId, data);
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
      fTitle.value = task.title; 
      fNotes.value = task.notes || '';
      fWeight.value = task.weight; 
      wDisp.textContent = task.weight;
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

// ── MOD-007 HistoryManager ─────────────────────────────────────────
const HistoryManager = (() => {
  const modal = document.getElementById('history-modal');
  const list = document.getElementById('history-list');
  const btnOpen = document.getElementById('history-btn');
  const btnClose = document.getElementById('btn-history-close');
  const btnDone = document.getElementById('btn-history-done');
  const btnClear = document.getElementById('btn-history-clear');

  const render = () => {
    const deleted = TaskStore.getDeleted();
    if (deleted.length === 0) {
      list.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">歷史清單是空的</div>';
      return;
    }
    list.innerHTML = deleted.map(t => `
      <div class="history-item" style="padding:16px; border-bottom:1px solid var(--input-bg); display:flex; justify-content:space-between; align-items:center;">
        <div style="flex:1;">
          <div style="font-weight:600; color:var(--text);">${t.title}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">刪除於: ${new Date(t.deletedAt).toLocaleString()}</div>
        </div>
        <button class="btn-restore" data-id="${t.id}" style="padding:6px 12px; border-radius:8px; border:1px solid var(--accent); background:none; color:var(--accent); cursor:pointer;">恢復</button>
      </div>
    `).join('');
  };

  btnOpen.addEventListener('click', () => { render(); modal.showModal(); });
  btnClose.addEventListener('click', () => modal.close());
  btnDone.addEventListener('click', () => modal.close());
  btnClear.addEventListener('click', () => { 
    if(confirm('確定要清空所有歷史記錄嗎？')) { 
      TaskStore.clearHistory(); 
      render(); 
    }
  });

  list.addEventListener('click', e => {
    if (e.target.classList.contains('btn-restore')) {
      TaskStore.restore(e.target.dataset.id);
      render();
    }
  });

  return { refresh: render };
})();

// ── Main App ──────────────────────────────────────────────────────
const App = {
  canvas: document.getElementById('blob-canvas'),
  ctx: document.getElementById('blob-canvas').getContext('2d'),
  emptyState: document.getElementById('empty-state'),

  refresh() {
    const parent = SubtaskView.getParent();
    const tasks = parent ? TaskStore.getChildren(parent.id) : TaskStore.getTopLevel();
    const vw = window.innerWidth, vh = window.innerHeight;
    
    const isEmpty = tasks.length === 0;
    this.emptyState.hidden = !isEmpty;
    document.getElementById('add-btn').style.display = isEmpty ? 'none' : 'flex';
    
    // Sync physics engine with current tasks
    PhysicsEngine.sync(tasks, vw, vh);
  },

  mousePos: null,

  loop() {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (this.canvas.width !== vw || this.canvas.height !== vh) {
      this.canvas.width = vw; this.canvas.height = vh;
    }

    PhysicsEngine.update(vw, vh, this.mousePos);
    const blobs = PhysicsEngine.getBlobs();
    CanvasRenderer.render(this.ctx, blobs);
    
    const parent = SubtaskView.getParent();
    const tasks = parent ? TaskStore.getChildren(parent.id) : TaskStore.getTopLevel();
    DOMOverlay.sync(tasks, blobs, this.canvas.parentElement);
    
    requestAnimationFrame(() => this.loop());
  },

  async init() {
    await TaskStore.init();
    EventBus.on('tasks:changed', () => this.refresh());
    document.getElementById('empty-cta').addEventListener('click', () => ModalManager.openAdd());
    
    window.addEventListener('resize', () => this.refresh());
    window.addEventListener('mousemove', e => this.mousePos = { x: e.clientX, y: e.clientY });
    window.addEventListener('mouseleave', () => this.mousePos = null);
    
    // 深色模式補強偵測
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => document.documentElement.classList.toggle('dark-mode', darkQuery.matches);
    darkQuery.addEventListener('change', updateTheme);
    updateTheme();

    this.refresh();
    this.loop();
  }
};

if (typeof document !== 'undefined' && document.getElementById('blob-canvas')) {
  App.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TaskStore, EventBus, App };
}
