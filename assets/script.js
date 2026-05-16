/* ====================================================================
   Site behaviour:
   - Tab mode (default): one slide at a time, sectioned sidebar
   - Present mode: snap-scroll, slide counter, arrow keys
   - Speaker notes drawer (synced to current slide)
   - Sidebar groups slides into 5 themed sections
   ==================================================================== */

(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const body = document.body;
  const main = $('main');
  const slides = () => $$('.slide');

  // ───── Section definitions (must match data-section attr) ─────
  const SECTIONS = [
    { id: 'overview',    label: 'Overview' },
    { id: 'expertise',   label: 'Technical Expertise' },
    { id: 'products',    label: 'Product Development' },
    { id: 'leadership',  label: 'Leadership & Standards' },
    { id: 'automation',  label: 'Automation & Quality' },
  ];

  const SECTION_LABELS = Object.fromEntries(SECTIONS.map(s => [s.id, s.label]));

  // ───── Build sectioned sidebar ─────
  const sidebarNav = $('#sidebar-nav');
  function buildSidebar() {
    sidebarNav.innerHTML = '';

    // Group slides by data-section
    const groups = new Map();
    SECTIONS.forEach(s => groups.set(s.id, []));
    slides().forEach((s, i) => {
      const sec = s.getAttribute('data-section') || 'other';
      if (!groups.has(sec)) groups.set(sec, []);
      groups.get(sec).push({ el: s, idx: i });
    });

    let globalIdx = 0;
    SECTIONS.forEach((secDef) => {
      const groupEls = groups.get(secDef.id) || [];
      if (groupEls.length === 0) return;

      const groupDiv = document.createElement('div');
      groupDiv.className = 'section-group';
      groupDiv.dataset.section = secDef.id;

      const header = document.createElement('button');
      header.className = 'section-header';
      header.innerHTML = `<span class="section-toggle expanded">▶</span><span>${secDef.label}</span>`;
      header.addEventListener('click', () => toggleSection(groupDiv));

      const slideContainer = document.createElement('div');
      slideContainer.className = 'section-slides';

      groupEls.forEach(({ el, idx }) => {
        const label = el.getAttribute('data-screen-label') || el.id || `Slide ${idx + 1}`;
        const btn = document.createElement('button');
        btn.className = 'sidebar-item';
        btn.setAttribute('role', 'tab');
        btn.dataset.index = idx;
        btn.innerHTML = `
          <span class="si-num">${String(idx).padStart(2, '0')}</span>
          <span class="si-label">${label.replace(/^\d+\s*/, '')}</span>
        `;
        btn.addEventListener('click', () => goTo(idx));
        slideContainer.appendChild(btn);
      });

      groupDiv.appendChild(header);
      groupDiv.appendChild(slideContainer);
      sidebarNav.appendChild(groupDiv);
    });
  }

  function toggleSection(groupDiv) {
    const container = groupDiv.querySelector('.section-slides');
    const toggle = groupDiv.querySelector('.section-toggle');
    const isExpanded = container.style.display !== 'none';
    container.style.display = isExpanded ? 'none' : '';
    toggle.classList.toggle('expanded', !isExpanded);
  }

  // ───── Tab switching ─────
  let currentIdx = 0;
  const sidebarItems = () => $$('.sidebar-item');
  const presentIdxEl = $('#present-index');
  const presentTotalEl = $('#present-total');
  const navCurrentEl = $('#nav-current');
  const navTotalEl = $('#nav-total');

  function goTo(idx) {
    const list = slides();
    if (!list.length) return;
    idx = Math.max(0, Math.min(list.length - 1, idx));
    if (idx === currentIdx && body.classList.contains('mode-tab')) return;

    if (body.classList.contains('mode-present')) {
      list[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      list.forEach((s) => s.classList.remove('active'));
      list[idx].classList.add('active');
    }

    setActive(idx);
    ensureSectionVisible(idx);
  }

  function ensureSectionVisible(idx) {
    const s = slides()[idx];
    if (!s) return;
    const secId = s.getAttribute('data-section') || 'other';
    const group = sidebarNav.querySelector(`.section-group[data-section="${secId}"]`);
    if (group) {
      const container = group.querySelector('.section-slides');
      const toggle = group.querySelector('.section-toggle');
      if (container && container.style.display === 'none') {
        container.style.display = '';
        if (toggle) toggle.classList.add('expanded');
      }
    }
  }

  function setActive(idx) {
    currentIdx = idx;
    sidebarItems().forEach((btn, i) => {
      const bIdx = parseInt(btn.dataset.index);
      btn.classList.toggle('active', bIdx === idx);
    });
    if (presentIdxEl) presentIdxEl.textContent = String(idx + 1).padStart(2, '0');
    if (navCurrentEl) navCurrentEl.textContent = idx + 1;
    updateNotes(idx);
    try { window.parent.postMessage({ slideIndexChanged: idx }, '*'); } catch (e) {}
  }

  function refreshTotal() {
    const n = slides().length;
    if (presentTotalEl) presentTotalEl.textContent = String(n).padStart(2, '0');
    if (navTotalEl) navTotalEl.textContent = n;
  }
  refreshTotal();

  // ───── IntersectionObserver for present mode ─────
  const io = new IntersectionObserver((entries) => {
    if (!body.classList.contains('mode-present')) return;
    let best = null;
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
    });
    if (best) {
      const idx = slides().indexOf(best.target);
      if (idx >= 0) setActive(idx);
    }
  }, { threshold: [0.3, 0.6, 0.9] });

  function observeSlides() { slides().forEach((s) => io.observe(s)); }
  observeSlides();

  const mo = new MutationObserver(() => {
    io.disconnect();
    observeSlides();
    buildSidebar();
    refreshTotal();
  });
  mo.observe(main, { childList: true });

  // ───── Speaker notes ─────
  const notesDrawer = $('#notes-drawer');
  const notesBody   = $('#notes-body');
  const notesSlideEl = $('#notes-slide-label');
  let notesData = [];
  try {
    notesData = JSON.parse(($('#speaker-notes')?.textContent || '[]').trim()) || [];
  } catch (e) { notesData = []; }

  function updateNotes(idx) {
    const s = slides()[idx];
    const label = s?.getAttribute('data-screen-label') || '';
    if (notesSlideEl) notesSlideEl.textContent = label;
    const note = notesData[idx];
    if (note && note.trim()) {
      notesBody.innerHTML = note
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
    } else {
      notesBody.innerHTML = '<p class="notes-empty">No speaker note for this slide.</p>';
    }
  }

  // ───── Toggles ─────
  function toggleNotes(force) {
    const open = force == null ? !notesDrawer.classList.contains('open') : !!force;
    notesDrawer.classList.toggle('open', open);
    $$('[data-action="toggle-notes"]').forEach(b => b.setAttribute('aria-pressed', open));
    if (open) updateNotes(currentIdx);
  }

  function togglePresent(force) {
    const on = force == null ? !body.classList.contains('mode-present') : !!force;
    body.classList.toggle('mode-present', on);
    body.classList.toggle('mode-tab', !on);
    $$('[data-action="toggle-present"]').forEach(b => b.setAttribute('aria-pressed', on));
    if (on) {
      slides().forEach((s) => s.classList.remove('active'));
      const s = slides()[currentIdx];
      if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      slides().forEach((s, i) => s.classList.toggle('active', i === currentIdx));
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.getAttribute('data-action');
    if (act === 'toggle-notes')   { e.preventDefault(); toggleNotes(); }
    if (act === 'toggle-present') { e.preventDefault(); togglePresent(); }
    if (act === 'print')          { e.preventDefault(); window.print(); }
    if (act === 'prev-slide')     { e.preventDefault(); goTo(currentIdx - 1); }
    if (act === 'next-slide')     { e.preventDefault(); goTo(currentIdx + 1); }
    if (act === 'nav-home')       { e.preventDefault(); goTo(0); }
  });

  // ───── Keyboard navigation ─────
  document.addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'p' || e.key === 'P') { togglePresent(); }
    else if (e.key === 'n' || e.key === 'N') { toggleNotes(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault(); goTo(currentIdx + 1);
    }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault(); goTo(currentIdx - 1);
    }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End')  { e.preventDefault(); goTo(slides().length - 1); }
    else if (e.key === 'Escape') {
      if (notesDrawer.classList.contains('open')) toggleNotes(false);
      else if (body.classList.contains('mode-present')) togglePresent(false);
    }
  });

  // ───── Four-quadrant matrix (S17) ─────
  function setQuadrant(id) {
    $$('.qd').forEach(b => b.setAttribute('aria-selected', b.dataset.quadrant === id ? 'true' : 'false'));
    $$('.qd-panel').forEach(p => p.hidden = (p.dataset.panel !== id));
  }
  document.addEventListener('click', (e) => {
    const q = e.target.closest('.qd');
    if (q) setQuadrant(q.dataset.quadrant);
  });

  // ───── Init ─────
  buildSidebar();
  slides().forEach((s, i) => s.classList.toggle('active', i === 0));
  setActive(0);
})();
