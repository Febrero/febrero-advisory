// A «Partilhar» button under every video on the site (Pedro, 2026-11-03: «adiciona um botão de share ao site de
// todos os vídeos»). Injected here so the HTML pages and the generator (ferramentas_site/paginas_ia.py) stay as they
// are: on phones it opens the system share sheet (WhatsApp, Messages…) with the video's own link; elsewhere it copies
// that link and says so. The link is the mp4 itself, which previews and plays anywhere, including inside WhatsApp.
(() => {
  'use strict';
  const T = {
    pt: { share: 'Partilhar', copied: 'Link copiado', whatsapp: 'WhatsApp', label: 'Partilhar este vídeo' },
    en: { share: 'Share', copied: 'Link copied', whatsapp: 'WhatsApp', label: 'Share this video' },
  };
  const css = `
.share-row{display:flex;align-items:center;gap:14px;padding:10px 0 2px;font-size:13px;line-height:1}
.share-btn{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid var(--line,rgba(221,210,241,.14));border-radius:999px;background:transparent;color:var(--body,#b5b0bd);font:inherit;font-size:13px;cursor:pointer;transition:color .2s,border-color .2s,background .2s;text-decoration:none}
.share-btn:hover,.share-btn:focus-visible{color:var(--ink,#f4f0f7);border-color:var(--accent,#d2bef4);outline:none}
.share-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.share-btn.done{color:var(--accent,#d2bef4);border-color:var(--accent,#d2bef4)}
@media(max-width:760px){.share-row{gap:10px}.share-btn{padding:8px 12px}}`;
  const ICON_SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>';
  const ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.4-4.4a8.5 8.5 0 1 1 15.6-4.5z"/><path d="M9.2 8.6c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3 0 .5a6 6 0 0 0 2.9 2.6c.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.3.1.4.2.4.4a2 2 0 0 1-1.4 1.9c-.8.3-2.2 0-3.9-1.2a9.3 9.3 0 0 1-3-3.4c-.6-1.2-.5-2.3-.1-3.3z"/></svg>';

  function lang(el) {
    const block = el.closest('.lang');
    if (block && /-en$/.test(block.id)) return 'en';
    if (block && /-pt$/.test(block.id)) return 'pt';
    return /^en\b/i.test(document.documentElement.lang || '') || location.pathname.startsWith('/en/') ? 'en' : 'pt';
  }
  function videoUrl(video) {
    const src = video.getAttribute('src') || (video.querySelector('source') || {}).getAttribute?.('src') || video.currentSrc;
    return src ? new URL(src, location.href).href : location.href;
  }
  function titleOf(video) {
    const card = video.closest('.proj') || video.parentElement;
    const b = card && card.querySelector('.pb b, b, h3');
    return (b ? b.textContent.trim() : document.title).slice(0, 120);
  }
  function build(video) {
    const t = T[lang(video)], url = videoUrl(video), title = titleOf(video);
    const row = document.createElement('div');
    row.className = 'share-row';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'share-btn'; btn.setAttribute('aria-label', t.label);
    btn.innerHTML = `${ICON_SHARE}<span>${t.share}</span>`;
    btn.addEventListener('click', async () => {
      if (navigator.share) {
        try { await navigator.share({ title, text: title, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      try { await navigator.clipboard.writeText(url); } catch (_) {
        const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (__) {} ta.remove();
      }
      const span = btn.querySelector('span'); span.textContent = t.copied; btn.classList.add('done');
      setTimeout(() => { span.textContent = t.share; btn.classList.remove('done'); }, 2200);
    });
    const wa = document.createElement('a');
    wa.className = 'share-btn'; wa.target = '_blank'; wa.rel = 'noopener';
    wa.href = 'https://wa.me/?text=' + encodeURIComponent(`${title} ${url}`);
    wa.setAttribute('aria-label', `${t.label} · ${t.whatsapp}`);
    wa.innerHTML = `${ICON_WA}<span>${t.whatsapp}</span>`;
    row.append(btn, wa);
    return row;
  }
  function init() {
    if (!document.getElementById('share-css')) {
      const style = document.createElement('style'); style.id = 'share-css'; style.textContent = css; document.head.appendChild(style);
    }
    document.querySelectorAll('video').forEach(video => {
      if (video.dataset.shareDone) return;
      video.dataset.shareDone = '1';
      video.insertAdjacentElement('afterend', build(video));
    });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
