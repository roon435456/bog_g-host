// ─── STATE ───────────────────────────────────────────────────────────────────
const state = {
  sites: JSON.parse(localStorage.getItem('wh_sites') || '[]'),
  pendingSite: null,
  files: [],
};

function saveSites() {
  localStorage.setItem('wh_sites', JSON.stringify(state.sites));
}

// ─── PAGES ───────────────────────────────────────────────────────────────────
function showPage(id) {
  document.getElementById('landing').style.display = id === 'landing' ? 'block' : 'none';
  document.getElementById('dashboard').style.display = id === 'dashboard' ? 'block' : 'none';
  if (id === 'dashboard') {
    showTab('sites');
    renderSites();
    renderStats();
  }
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = p.id === 'tab-' + id ? 'block' : 'none');
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function renderStats() {
  document.getElementById('stat-sites').textContent = state.sites.length;
  document.getElementById('stat-live').textContent = state.sites.filter(s => s.live).length;
}

// ─── SITES ────────────────────────────────────────────────────────────────────
function renderSites() {
  const grid = document.getElementById('sites-grid');
  if (state.sites.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text3);">
      <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 16px;display:block;opacity:0.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      <p style="font-size:14px;">No sites yet — create your first one</p>
    </div>`;
    return;
  }
  grid.innerHTML = state.sites.map((site, i) => `
    <div class="site-card">
      <div class="site-card-top">
        <span class="site-name">${escHtml(site.name)}</span>
        <span class="site-status"><span class="status-dot"></span>live</span>
      </div>
      <div class="site-url">⚡ <span>${location.origin}/sites/${escHtml(site.slug)}</span></div>
      <div class="site-card-actions">
        <a href="sites/${escHtml(site.slug)}/index.html" target="_blank" class="button" style="padding:6px 14px;font-size:11px;">
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M14 1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm-1 11H3V3h10v9z"/></svg>
          view
        </a>
        <button class="button ghost" style="padding:6px 14px;font-size:11px;" onclick="deleteSite(${i})">
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
          delete
        </button>
      </div>
    </div>
  `).join('');
}

function deleteSite(i) {
  if (!confirm(`Delete "${state.sites[i].name}"? This cannot be undone.`)) return;
  state.sites.splice(i, 1);
  saveSites();
  renderSites();
  renderStats();
  showToast('Site deleted', 'error');
}

// ─── URL SLUG PREVIEW ─────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('site-name-input');
  const slugInput = document.getElementById('site-slug-input');
  const slugPreview = document.getElementById('slug-preview');

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      const auto = slugify(nameInput.value);
      if (slugInput.value === '' || slugInput.dataset.auto === 'true') {
        slugInput.value = auto;
        slugInput.dataset.auto = 'true';
        slugPreview.textContent = auto || 'your-site';
      }
    });
    slugInput.addEventListener('input', () => {
      slugInput.dataset.auto = 'false';
      slugPreview.textContent = slugify(slugInput.value) || 'your-site';
    });
  }

  // Tab setup
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => showTab(t.dataset.tab));
  });

  // File upload zone
  setupDropzone();
});

// ─── CREATE SITE FLOW ─────────────────────────────────────────────────────────
function startCreate() {
  const nameInput = document.getElementById('site-name-input');
  const slugInput = document.getElementById('site-slug-input');
  const name = nameInput.value.trim();
  const slug = slugify(slugInput.value || name);

  if (!name) { showToast('Enter a site name', 'error'); return; }
  if (!slug) { showToast('Enter a valid URL slug', 'error'); return; }
  if (state.sites.find(s => s.slug === slug)) { showToast('That slug is taken', 'error'); return; }

  state.pendingSite = { name, slug };
  openRulesModal();
}

function openRulesModal() {
  document.getElementById('rules-modal').classList.add('open');
  document.getElementById('agree-checkbox').checked = false;
  document.getElementById('publish-btn').disabled = true;
}

document.addEventListener('DOMContentLoaded', () => {
  const agree = document.getElementById('agree-checkbox');
  const btn = document.getElementById('publish-btn');
  if (agree) {
    agree.addEventListener('change', () => { btn.disabled = !agree.checked; });
  }
});

function closeModal() {
  document.getElementById('rules-modal').classList.remove('open');
}

function publishSite() {
  if (!state.pendingSite) return;
  const { name, slug } = state.pendingSite;

  // In a real app, files would upload to server. Here we store metadata.
  const site = { name, slug, live: true, files: state.files.map(f => f.name), created: new Date().toISOString() };
  state.sites.push(site);
  saveSites();
  state.files = [];
  renderFileList();

  document.getElementById('site-name-input').value = '';
  document.getElementById('site-slug-input').value = '';
  document.getElementById('slug-preview').textContent = 'your-site';
  state.pendingSite = null;

  closeModal();
  showTab('sites');
  renderSites();
  renderStats();
  showToast(`⚡ "${name}" is live!`, 'success');
}

// ─── FILE DROPZONE ────────────────────────────────────────────────────────────
function setupDropzone() {
  const zone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  if (!zone) return;

  zone.addEventListener('click', () => fileInput.click());

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    addFiles(Array.from(e.dataTransfer.files));
  });

  fileInput.addEventListener('change', () => {
    addFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });
}

function addFiles(newFiles) {
  newFiles.forEach(f => {
    if (!state.files.find(x => x.name === f.name)) state.files.push(f);
  });
  renderFileList();
}

function removeFile(name) {
  state.files = state.files.filter(f => f.name !== name);
  renderFileList();
}

function renderFileList() {
  const list = document.getElementById('file-list');
  if (!list) return;
  list.innerHTML = state.files.map(f => `
    <div class="file-item">
      <span class="file-item-name">${escHtml(f.name)}</span>
      <span style="display:flex;align-items:center;gap:8px;">
        <span class="file-item-size">${formatBytes(f.size)}</span>
        <button class="file-remove" onclick="removeFile('${escHtml(f.name)}')" title="Remove">×</button>
      </span>
    </div>
  `).join('');
}

function formatBytes(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return Math.round(b / 1024) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => t.classList.add('show'));
  });
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
