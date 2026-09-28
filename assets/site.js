(() => {
  'use strict';
  const languages = [...document.querySelectorAll('.lang')];
  const buttons = { pt: document.getElementById('btn-pt'), en: document.getElementById('btn-en') };
  function setLanguage(lang, remember) {
    lang = lang === 'en' ? 'en' : 'pt';
    const previous = document.documentElement.lang;
    languages.forEach(block => {
      block.hidden = block.id !== `lang-${lang}`;
      if (block.hidden) block.querySelectorAll('video').forEach(video => video.pause());
    });
    Object.entries(buttons).forEach(([key, button]) => button.setAttribute('aria-pressed', String(key === lang)));
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'Pedro Febrero — AI advisory and implementation' : 'Pedro Febrero — Consultoria e implementação de IA';
    document.querySelectorAll('[data-pt]').forEach(node => { node.textContent = node.dataset[lang]; });
    document.querySelectorAll('[data-jump]').forEach(node => { node.href = `#${node.dataset.jump}-${lang}`; });
    document.querySelector('.skip-link').textContent = lang === 'en' ? 'Skip to content' : 'Saltar para o conteúdo';
    if (remember) {
      try { localStorage.setItem('lang', lang); } catch (_) {}
      if (location.hash.endsWith(`-${previous}`)) {
        const nextHash = location.hash.replace(new RegExp(`-${previous}$`), `-${lang}`);
        history.replaceState(null, '', nextHash);
        document.querySelector(nextHash)?.scrollIntoView({ behavior: 'instant' });
      }
    }
    document.dispatchEvent(new Event('languagechange'));
  }
  let saved;
  try { saved = localStorage.getItem('lang'); } catch (_) {}
  const hashLang = location.hash.match(/-(pt|en)$/)?.[1];
  setLanguage(hashLang || saved || ((navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en'), false);
  buttons.pt.addEventListener('click', () => setLanguage('pt', true));
  buttons.en.addEventListener('click', () => setLanguage('en', true));
  addEventListener('hashchange', () => {
    const lang = location.hash.match(/-(pt|en)$/)?.[1];
    if (lang && lang !== document.documentElement.lang) setLanguage(lang, true);
  });
  const bar = document.getElementById('langbar');
  const onScroll = () => bar.classList.toggle('small', scrollY > 60);
  addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // Enhance the original, fully readable portfolio into accessible tab panels.
  languages.forEach(block => {
    const en = block.id === 'lang-en';
    const heads = [...block.querySelectorAll('h3.area')];
    if (!heads.length) return;
    const wrap = heads[0].parentElement;
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', en ? 'Project categories' : 'Categorias de projetos');
    const names = en ? ['Organisational processes', 'Content & advertising', 'Clients & sales', 'Commerce & retail', 'Markets & Web3', 'Web experiences'] : ['Processos da organização', 'Conteúdo e publicidade', 'Clientes e vendas', 'Comércio e retalho', 'Mercados e Web3', 'Experiências web'];
    const panels = [];
    heads.forEach((heading, index) => {
      const panel = document.createElement('div');
      panel.className = 'panel';
      panel.id = `${block.id}-panel-${index}`;
      panel.setAttribute('role', 'tabpanel');
      panel.tabIndex = 0;
      wrap.insertBefore(panel, heading);
      let node = heading;
      while (node && !(node !== heading && node.matches?.('h3.area'))) {
        const next = node.nextSibling;
        panel.appendChild(node);
        node = next;
      }
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = `${block.id}-tab-${index}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      tab.innerHTML = `<span class="tab-number" aria-hidden="true">0${index+1}</span>${names[index]}`;
      panel.setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', () => select(index));
      tabs.appendChild(tab);
      panels.push({ tab, panel });
      const grid = panel.querySelector('.projects');
      if (grid?.querySelector('video')) grid.classList.add('g3');
      if (!grid) return;
      grid.id = `${panel.id}-projects`;
      const projects = [...grid.querySelectorAll('.proj')];
      if (projects.length > 4) {
        const extras = projects.slice(3);
        extras.forEach(project => { project.hidden = true; });
        const more = document.createElement('button');
        more.className = 'more';
        more.type = 'button';
        more.setAttribute('aria-controls', grid.id);
        let expanded = false;
        const update = () => {
          more.textContent = expanded ? (en ? 'Show fewer −' : 'Mostrar menos −') : (en ? `Explore ${extras.length} more projects +` : `Explorar mais ${extras.length} projetos +`);
          more.setAttribute('aria-expanded', String(expanded));
        };
        more.addEventListener('click', () => {
          expanded = !expanded;
          extras.forEach(project => {
            project.hidden = !expanded;
            if (!expanded) project.querySelectorAll('video').forEach(video => video.pause());
          });
          update();
        });
        update();
        panel.appendChild(more);
      }
    });
    wrap.insertBefore(tabs, panels[0].panel);
    function select(index, focus = false) {
      panels.forEach((entry, key) => {
        entry.panel.hidden = key !== index;
        entry.tab.setAttribute('aria-selected', String(key === index));
        entry.tab.tabIndex = key === index ? 0 : -1;
        if (key !== index) entry.panel.querySelectorAll('video').forEach(video => video.pause());
      });
      if (focus) panels[index].tab.focus({ preventScroll:true });
      if (focus) panels[index].tab.scrollIntoView({ block:'nearest', inline:'nearest', behavior:'instant' });
    }
    tabs.addEventListener('keydown', event => {
      const current = panels.findIndex(entry => entry.tab.getAttribute('aria-selected') === 'true');
      let next;
      if (event.key === 'ArrowRight') next = (current+1)%panels.length;
      if (event.key === 'ArrowLeft') next = (current-1+panels.length)%panels.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = panels.length-1;
      if (next !== undefined) { event.preventDefault(); select(next, true); }
    });
    select(0);
  });
  // Avoid multiple simultaneous audio streams, including across languages.
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
    });
  });
})();
