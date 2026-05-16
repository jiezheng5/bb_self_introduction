/* ====================================================================
   Site behaviour:
   - Read mode (default): long scroll
   - Present mode: snap-scroll, slide counter, arrow keys
   - Speaker notes drawer (synced to current slide)
   - Side rail builds itself from .slide sections
   ==================================================================== */

(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const body = document.body;
  const main = $('main');
  const slides = () => $$('.slide');

  // ───── Build side rail ─────
  const rail = $('#rail-list');
  function buildRail() {
    rail.innerHTML = '';
    slides().forEach((s) => {
      const id = s.id || '';
      const label = s.getAttribute('data-screen-label') || id;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.setAttribute('data-target', id);
      a.innerHTML = `<span class="rail-label">${label}</span>`;
      li.appendChild(a);
      rail.appendChild(li);
    });
  }
  buildRail();

  // ───── Active section tracking ─────
  let currentIdx = 0;
  const railLinks = () => $$('#rail-list a');
  const presentIdxEl = $('#present-index');
  const presentTotalEl = $('#present-total');

  function setActive(idx) {
    currentIdx = idx;
    railLinks().forEach((a, i) => a.classList.toggle('active', i === idx));
    if (presentIdxEl) presentIdxEl.textContent = String(idx + 1).padStart(2, '0');
    updateNotes(idx);
    // Tell host (for editor) the current slide
    try { window.parent.postMessage({ slideIndexChanged: idx }, '*'); } catch (e) {}
  }

  function refreshTotal() {
    const n = slides().length;
    if (presentTotalEl) presentTotalEl.textContent = String(n).padStart(2, '0');
  }
  refreshTotal();

  const io = new IntersectionObserver((entries) => {
    // Find the entry most visible
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

  function observeSlides() {
    slides().forEach((s) => io.observe(s));
  }
  observeSlides();

  // Re-observe whenever new slides are added (sections appended over time)
  const mo = new MutationObserver(() => {
    io.disconnect();
    observeSlides();
    buildRail();
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

  // ───── Buttons / toggles ─────
  function toggleNotes(force) {
    const open = force == null ? !notesDrawer.classList.contains('open') : !!force;
    notesDrawer.classList.toggle('open', open);
    $$('[data-action="toggle-notes"]').forEach(b => b.setAttribute('aria-pressed', open));
    if (open) updateNotes(currentIdx);
  }
  function togglePresent(force) {
    const on = force == null ? !body.classList.contains('mode-present') : !!force;
    body.classList.toggle('mode-present', on);
    body.classList.toggle('mode-read', !on);
    $$('[data-action="toggle-present"]').forEach(b => b.setAttribute('aria-pressed', on));
    if (on) {
      // Snap to current slide
      const s = slides()[currentIdx];
      if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.getAttribute('data-action');
    if (act === 'toggle-notes')   { e.preventDefault(); toggleNotes(); }
    if (act === 'toggle-present') { e.preventDefault(); togglePresent(); }
    if (act === 'print')          { e.preventDefault(); window.print(); }
  });

  // Rail link click → smooth scroll, even in present mode where snap is on
  document.addEventListener('click', (e) => {
    const a = e.target.closest('#rail-list a, .chrome-nav a');
    if (!a) return;
    const id = a.getAttribute('href')?.replace('#','');
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (body.classList.contains('mode-present')) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ───── Keyboard ─────
  function goTo(idx) {
    const list = slides();
    idx = Math.max(0, Math.min(list.length - 1, idx));
    list[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('keydown', (e) => {
    // Don't steal from inputs
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

  // Initial active
  setActive(0);

  // ───── Four-quadrant interactive matrix (S17) ─────
  function setQuadrant(id) {
    $$('.qd').forEach(b => b.setAttribute('aria-selected', b.dataset.quadrant === id ? 'true' : 'false'));
    $$('.qd-panel').forEach(p => p.hidden = (p.dataset.panel !== id));
  }
  document.addEventListener('click', (e) => {
    const q = e.target.closest('.qd');
    if (q) setQuadrant(q.dataset.quadrant);
  });
})();
