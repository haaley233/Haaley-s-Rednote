/* ===========================
   内容工作台 · 主逻辑
   =========================== */

// 注册 lucide 图标
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initApp();
});

function initApp() {
  initTabs();
  initTheme();
  initToasts();
  initIdeaGenerator();
  initContentCalendar();
  initCompetitorLibrary();
  initProfileCard();
  loadAllData();
}

// ===========================
// Toast
// ===========================
let toastStackEl = null;

function initToasts() {
  toastStackEl = document.getElementById('toast-stack');
}

function toast(message, type = 'success') {
  if (!toastStackEl) return;
  const icon = type === 'error' ? 'alert-triangle' : 'check-circle-2';
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i data-lucide="${icon}"></i><div class="toast-text"></div>`;
  el.querySelector('.toast-text').textContent = message;
  toastStackEl.appendChild(el);
  lucide.createIcons();
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; }, 2200);
  setTimeout(() => { el.remove(); }, 2500);
}

// ===========================
// Theme
// ===========================
function initTheme() {
  const saved = LS.get('theme', null);
  if (saved === 'light' || saved === 'dark') {
    document.body.dataset.theme = saved;
  }

  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  syncThemeButton();

  btn.addEventListener('click', () => {
    const current = document.body.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = next;
    LS.set('theme', next);
    syncThemeButton();
    toast(next === 'light' ? '已切换到浅色主题' : '已切换到深色主题', 'success');
  });
}

function syncThemeButton() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  const isLight = document.body.dataset.theme === 'light';
  btn.innerHTML = `<i data-lucide="${isLight ? 'sun' : 'moon'}"></i><span class="nav-action-text">主题</span>`;
  lucide.createIcons();
}

// ===========================
// 通用数据读写
// ===========================
const LS = {
  get(key, fallback = null) {
    try {
      return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

// ===========================
// 标签页切换
// ===========================
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tab).classList.add('active');
      lucide.createIcons();
    });
  });
}

// ===========================
// 选题灵感库
// ===========================
const TITLE_TEMPLATES = [
  "✨{keyword}女孩｜坚持这些习惯真的会变好",
  "西交女大 {keyword}日常｜室友说我越来越…",
  "不允许你还不知道的 {keyword}宝藏",
  "{keyword}plog｜今天被问爆了🔥",
  "救命！{keyword}这件事做对了秒变氛围感",
  "真心建议：大二开始 {keyword}，毕业领先同龄人",
  "{keyword}一年，我收获了什么",
  "学生党 {keyword}｜零成本也能精致",
  "为什么越 {keyword} 越上瘾？",
  "沉浸式体验 {keyword}的一天",
];

const HOOK_TEMPLATES = [
  "没有人告诉我 {keyword} 这么爽…",
  "室友问我怎么做到的，其实就靠这 {keyword}3步",
  "跟风 {keyword} 一个月，结果出乎意料",
  "{keyword}才是大学最值的投资",
  "女生 {keyword} 真的能开挂",
];

function initIdeaGenerator() {
  const btn = document.getElementById('generate-btn');
  const input = document.getElementById('idea-keyword');

  btn.addEventListener('click', generateIdeas);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') generateIdeas(); });

  document.getElementById('clear-history').addEventListener('click', () => {
    LS.set('ideaHistory', []);
    renderHistory();
  });
}

function generateIdeas() {
  const keyword = document.getElementById('idea-keyword').value.trim();
  if (!keyword) { toast('请输入关键词', 'error'); return; }

  const titles = TITLE_TEMPLATES.map(t => t.replace('{keyword}', keyword));
  const hooks = HOOK_TEMPLATES.map(h => h.replace('{keyword}', keyword));

  const results = [...titles.slice(0, 7), ...hooks.slice(0, 3)];
  shuffleArray(results);

  // 保存历史
  const history = LS.get('ideaHistory', []);
  history.unshift({ keyword, time: new Date().toLocaleString(), count: results.length });
  LS.set('ideaHistory', history.slice(0, 20));

  renderResults(results);
  renderHistory();
}

function renderResults(items) {
  const list = document.getElementById('idea-list');
  document.getElementById('idea-count').textContent = items.length + ' 条';

  list.innerHTML = items.map((item, i) => `
    <div class="idea-item" onclick="copyText(this)">
      <div class="idea-item-num">${i + 1}</div>
      <div class="idea-item-text">${item}</div>
      <div class="idea-item-copy">复制</div>
    </div>
  `).join('');
}

function renderHistory() {
  const history = LS.get('ideaHistory', []);
  const list = document.getElementById('history-list');

  if (!history.length) {
    list.innerHTML = '<div class="empty-state"><p>暂无历史记录</p></div>';
    return;
  }

  list.innerHTML = history.slice(0, 10).map(h => `
    <div class="history-item" onclick="reuseKeyword('${escapeAttr(h.keyword)}')">
      <div>
        <span class="history-item-keyword">${h.keyword}</span>
        <span class="history-item-count">· ${h.count}条</span>
      </div>
      <span class="history-item-time">${h.time}</span>
    </div>
  `).join('');
}

function reuseKeyword(keyword) {
  const input = document.getElementById('idea-keyword');
  input.value = keyword;
  input.focus();
  generateIdeas();
  toast(`已生成「${keyword}」的新标题`, 'success');
}

function copyText(el) {
  const text = el.querySelector('.idea-item-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = el.querySelector('.idea-item-copy');
    btn.textContent = '已复制!';
    btn.style.color = '#4ade80';
    setTimeout(() => { btn.textContent = '复制'; btn.style.color = ''; }, 1500);
    toast('已复制到剪贴板', 'success');
  });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===========================
// 内容日历
// ===========================
let chart = null;
let editingNoteId = null;

function initContentCalendar() {
  document.getElementById('add-note-btn').addEventListener('click', openNoteModal);
  document.getElementById('close-modal-btn').addEventListener('click', closeNoteModal);
  document.getElementById('cancel-note-btn').addEventListener('click', closeNoteModal);
  document.getElementById('save-note-btn').addEventListener('click', saveNote);

  document.getElementById('note-modal').addEventListener('click', e => {
    if (e.target.id === 'note-modal') closeNoteModal();
  });
}

function openNoteModal(noteId = null) {
  editingNoteId = noteId;
  document.getElementById('modal-title').textContent = noteId ? '编辑笔记' : '新增笔记';
  const modal = document.getElementById('note-modal');
  modal.classList.add('show');

  if (noteId) {
    const notes = LS.get('notes', []);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      document.getElementById('note-date').value = note.date;
      document.getElementById('note-title').value = note.title;
      document.getElementById('note-impression').value = note.impression;
      document.getElementById('note-like').value = note.like;
      document.getElementById('note-collect').value = note.collect;
      document.getElementById('note-follow').value = note.follow;
    }
  } else {
    document.querySelectorAll('#note-modal input').forEach(i => i.value = '');
    document.getElementById('note-date').value = new Date().toISOString().split('T')[0];
  }
  lucide.createIcons();
}

function closeNoteModal() {
  document.getElementById('note-modal').classList.remove('show');
  editingNoteId = null;
}

function saveNote() {
  const date = document.getElementById('note-date').value;
  const title = document.getElementById('note-title').value.trim();
  const impression = parseInt(document.getElementById('note-impression').value) || 0;
  const like = parseInt(document.getElementById('note-like').value) || 0;
  const collect = parseInt(document.getElementById('note-collect').value) || 0;
  const follow = parseInt(document.getElementById('note-follow').value) || 0;

  if (!date || !title) { toast('请填写日期和标题', 'error'); return; }

  const notes = LS.get('notes', []);

  if (editingNoteId) {
    const idx = notes.findIndex(n => n.id === editingNoteId);
    if (idx !== -1) {
      notes[idx] = { id: editingNoteId, date, title, impression, like, collect, follow };
    }
  } else {
    notes.push({ id: Date.now().toString(), date, title, impression, like, collect, follow });
  }

  notes.sort((a, b) => new Date(a.date) - new Date(b.date));
  LS.set('notes', notes);
  closeNoteModal();
  renderNotes();
  updateChart();
}

function renderNotes() {
  const notes = LS.get('notes', []);
  document.getElementById('notes-count').textContent = notes.length + ' 篇';
  const tbody = document.getElementById('notes-tbody');

  if (!notes.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7"><div class="empty-state"><i data-lucide="file-text"></i><p>暂无记录，点击右上角"新增笔记"开始</p></div></td></tr>`;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = notes.map(n => `
    <tr>
      <td>${n.date}</td>
      <td>${n.title}</td>
      <td>${fmt(n.impression)}</td>
      <td>${fmt(n.like)}</td>
      <td>${fmt(n.collect)}</td>
      <td>+${fmt(n.follow)}</td>
      <td>
        <button class="btn-ghost btn-sm" onclick="editNote('${n.id}')">编辑</button>
        <button class="btn-ghost btn-sm" onclick="deleteNote('${n.id}')" style="color:#ff6b6b">删除</button>
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

function editNote(id) { openNoteModal(id); }

function deleteNote(id) {
  if (!confirm('确认删除这条记录？')) return;
  const notes = LS.get('notes', []).filter(n => n.id !== id);
  LS.set('notes', notes);
  renderNotes();
  updateChart();
  toast('已删除记录', 'success');
}

function updateChart() {
  const notes = LS.get('notes', []);
  const ctx = document.getElementById('growth-chart').getContext('2d');

  const sorted = [...notes].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sorted.map(n => n.date);
  const impressionData = sorted.map(n => n.impression);
  const likeData = sorted.map(n => n.like);
  const followData = sorted.map(n => n.follow);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '曝光',
          data: impressionData,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255,107,107,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: '点赞',
          data: likeData,
          borderColor: '#FEC89A',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: '涨粉',
          data: followData,
          borderColor: '#4ade80',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#A0A0B0', font: { family: "'Inter', sans-serif" } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#A0A0B0' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: { color: '#A0A0B0' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function fmt(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

// ===========================
// 竞品素材库
// ===========================
const COMP_TAGS = ['情绪共鸣', '实用干货', '视觉冲击', '标题党', '真实感', '蹭热点', '反差感'];

function initCompetitorLibrary() {
  document.getElementById('add-comp-btn').addEventListener('click', addCompetitor);
  const search = document.getElementById('comp-search');
  if (search) {
    search.addEventListener('input', () => {
      LS.set('compSearch', search.value.trim());
      renderCompetitors();
    });
  }
  renderCompFilters();
  renderCompetitors();
}

function renderCompFilters() {
  const container = document.getElementById('comp-filters');
  const activeFilter = LS.get('compFilter', null);

  container.innerHTML = [
    `<div class="tag-pill ${!activeFilter ? 'active' : ''}" onclick="filterComp(null)">全部</div>`,
    ...COMP_TAGS.map(tag => `
      <div class="tag-pill ${activeFilter === tag ? 'active' : ''}" onclick="filterComp('${tag}')">${tag}</div>
    `)
  ].join('');
}

function filterComp(tag) {
  LS.set('compFilter', tag);
  renderCompFilters();
  renderCompetitors();
}

function addCompetitor() {
  const url = document.getElementById('comp-url').value.trim();
  const title = document.getElementById('comp-title').value.trim();
  const tag = document.getElementById('comp-tag').value.trim();
  const like = parseInt(document.getElementById('comp-like').value) || 0;
  const collect = parseInt(document.getElementById('comp-collect').value) || 0;
  const comment = parseInt(document.getElementById('comp-comment').value) || 0;

  if (!url || !title) { toast('请填写链接和标题', 'error'); return; }

  const comps = LS.get('competitors', []);
  comps.unshift({
    id: Date.now().toString(),
    url, title, tag: tag || '待研究',
    like, collect, comment,
    time: new Date().toLocaleDateString()
  });
  LS.set('competitors', comps);

  // 清空输入框
  ['comp-url','comp-title','comp-tag','comp-like','comp-collect','comp-comment'].forEach(id => {
    document.getElementById(id).value = '';
  });

  renderCompetitors();
  toast('已添加到素材库', 'success');
}

function renderCompetitors() {
  const comps = LS.get('competitors', []);
  const filter = LS.get('compFilter', null);
  const search = (LS.get('compSearch', '') || '').toString().trim().toLowerCase();
  const base = filter ? comps.filter(c => c.tag === filter) : comps;
  const filtered = search
    ? base.filter(c => `${c.title} ${c.tag} ${c.url}`.toLowerCase().includes(search))
    : base;
  const grid = document.getElementById('comp-grid');

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state"><i data-lucide="library"></i><p>暂无素材，添加第一条吧</p></div>';
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(c => `
    <div class="comp-card" onclick="window.open('${c.url}', '_blank')">
      <div class="comp-card-tag">${c.tag}</div>
      <div class="comp-card-title">${c.title}</div>
      <div class="comp-card-stats">
        <span>❤️ ${fmt(c.like)}</span>
        <span>⭐ ${fmt(c.collect)}</span>
        <span>💬 ${fmt(c.comment)}</span>
      </div>
      <a class="comp-card-link" href="${c.url}" target="_blank" onclick="event.stopPropagation()">查看原文 →</a>
      <div style="margin-top:8px; display:flex; gap:8px;">
        <button class="btn-ghost btn-sm" onclick="event.stopPropagation(); deleteComp('${c.id}')" style="color:#ff6b6b;font-size:11px;padding:3px 8px;">删除</button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function deleteComp(id) {
  const comps = LS.get('competitors', []).filter(c => c.id !== id);
  LS.set('competitors', comps);
  renderCompetitors();
  toast('已删除素材', 'success');
}

// ===========================
// 个人名片
// ===========================
function initProfileCard() {
  document.getElementById('copy-profile-btn').addEventListener('click', copyProfile);
  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    const form = document.getElementById('edit-form');
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
  });
  document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
}

function copyProfile() {
  const text = document.getElementById('profile-text').querySelector('pre').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-profile-btn');
    btn.innerHTML = '<i data-lucide="check"></i> 已复制!';
    lucide.createIcons();
    toast('名片已复制到剪贴板', 'success');
    setTimeout(() => {
      btn.innerHTML = '<i data-lucide="copy"></i> 复制到剪贴板';
      lucide.createIcons();
    }, 2000);
  });
}

function saveProfile() {
  const fans = document.getElementById('edit-fans').value;
  const likes = document.getElementById('edit-likes').value;
  const peak = document.getElementById('edit-peak').value;
  const growth = document.getElementById('edit-growth').value;

  document.getElementById('stat-fans').textContent = fans;
  document.getElementById('stat-likes').textContent = likes;
  document.getElementById('stat-peak').textContent = peak;
  document.getElementById('stat-growth').textContent = growth;

  updateProfileText(fans, likes, peak, growth);

  const data = { fans, likes, peak, growth };
  LS.set('profileData', data);

  document.getElementById('edit-form').style.display = 'none';
}

function updateProfileText(fans, likes, peak, growth) {
  document.getElementById('profile-text').querySelector('pre').innerHTML =
`📱 小红书创作者数据卡
━━━━━━━━━━━━━━━━━
昵称：Haaley
粉丝：${fans}（即将突破千粉）
获赞与收藏：${likes}+
单篇最高曝光：${peak}
近30天曝光增长：${growth}
内容定位：大学生成长/校园生活
平台：西安交通大学 · 网络与新媒体`;
}

function loadAllData() {
  // 恢复竞品搜索
  const search = document.getElementById('comp-search');
  if (search) search.value = LS.get('compSearch', '') || '';

  // 加载个人数据
  const pd = LS.get('profileData', null);
  if (pd) {
    ['edit-fans','edit-likes','edit-peak','edit-growth'].forEach(id => {
      document.getElementById(id).value = pd[id.replace('edit-', '')] || '';
    });
    saveProfile();
  }

  // 加载其他数据
  renderHistory();
  renderNotes();
  updateChart();
  renderCompetitors();
}

function escapeAttr(s) {
  return String(s)
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\n', ' ');
}
