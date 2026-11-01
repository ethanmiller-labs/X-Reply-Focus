(() => {
  const {norm,hiddenIds,isOwnPost,resolvePostContext,articleIdentity}=XUF;
  let state={enabled:false,override:'',confirmed:{}}, records=new Map();
  let panel, status, toggle, input, timer, saving, ready=false;
  const text=()=>XUF_I18N.messages[XUF_I18N.current()];
  let retainedContext=null, retainedColumn=null;
  function account() {
    if(state.override) return norm(state.override);
    const profile=document.querySelector('a[data-testid="AppTabBar_Profile_Link"]');
    return norm(profile?.getAttribute('href')?.match(/^\/([A-Za-z0-9_]{1,15})\/?$/)?.[1]);
  }
  function save() {
    clearTimeout(saving);
    saving=setTimeout(()=>chrome.storage.local.set({xufState:state}),250);
  }
  function confirmedFor(who) {return state.confirmed[who] || (state.confirmed[who]={});}
  function ingest(items) {
    for(const r of items) {
      if(!/^\d{1,30}$/.test(r.id) || !/^[A-Za-z0-9_]{1,15}$/.test(r.author || '') || (r.parent!==null && !/^\d{1,30}$/.test(r.parent))) continue;
      records.set(r.id,{id:r.id,author:norm(r.author),parent:r.parent});
    }
    schedule();
  }
  window.addEventListener('message',e=>{
    if(e.source===window && e.origin===location.origin && e.data?.type==='XUF_RECORDS_V1' && Array.isArray(e.data.records)) ingest(e.data.records.slice(0,20000));
  });
  // Throttle rather than debounce: continuous timeline changes must not delay filtering.
  function schedule() {if(!timer) timer=setTimeout(()=>{timer=null;render();},100);}
  function createPanel() {
    panel=document.createElement('section');panel.id='xuf-panel';panel.dataset.version='1.2.2';
    panel.innerHTML='<div class="xuf-top"><strong>X Reply Focus</strong><button type="button" aria-pressed="false"></button></div><details><summary></summary><label><span class="xuf-username"></span><input maxlength="16" autocomplete="off"></label><p></p><button type="button" class="xuf-reset"></button></details><div class="xuf-status" aria-live="polite"></div>';
    toggle=panel.querySelector('[aria-pressed]');status=panel.querySelector('.xuf-status');input=panel.querySelector('input');input.value=state.override;
    toggle.onclick=()=>{state.enabled=!state.enabled;save();render();};
    input.oninput=()=>input.setCustomValidity('');
    input.onchange=()=>{
      const value=norm(input.value);
      if(value && !/^[a-z0-9_]{1,15}$/.test(value)){input.setCustomValidity(text().invalid);input.reportValidity();return;}
      state.override=value;save();render();
    };
    panel.querySelector('.xuf-reset').onclick=()=>{
      const who=account();if(who){state.confirmed[who]={};records.clear();save();render();}
    };
  }
  const articleId = article => articleIdentity(article)?.id;
  const articleAuthor = article => articleIdentity(article)?.author || '';
  function safeCell(element) {
    const cell=element.closest('[data-testid="cellInnerDiv"]');
    // Never hide a shared container containing another tweet or the control panel.
    return cell && !cell.querySelector('#xuf-panel') && cell.querySelectorAll('article[data-testid="tweet"]').length<=1?cell:element;
  }
  function render() {
    if(!ready || !document.body) return;
    const who=account();
    const desired=new Set();
    const column=document.querySelector('[data-testid="primaryColumn"]');
    const context=resolvePostContext(location.pathname,retainedContext,
      !!document.querySelector('[role="dialog"]'),!!column && column===retainedColumn);
    const root=context?.root;
    if(context && column && isOwnPost(context.author,who)) {
      retainedContext=context;retainedColumn=column;
    } else {retainedContext=null;retainedColumn=null;}
    const articles=[...(column?.querySelectorAll('article[data-testid="tweet"]') || [])];
    const focal=root && articles.find(a=>articleId(a)===root);
    // Remove any controls left by older versions. Never put buttons inside X's flex article.
    document.querySelectorAll('.xuf-mark').forEach(b=>b.remove());
    // Only activate on the selected account's own focal post.
    if(root && column && isOwnPost(context.author,who)) {
      if(!panel) createPanel();
      if(focal) {if(panel.previousElementSibling!==focal) focal.after(panel);}
      else panel.remove();
      const confirmed=who?confirmedFor(who):{};
      let changed=false;
      if(who) for(const r of records.values()) if(r.author===who && r.parent) {
        if(!confirmed[r.parent]) {confirmed[r.parent]=Date.now();changed=true;}
      }
      const keys=Object.keys(confirmed);
      if(keys.length>10000) for(const id of keys.sort((a,b)=>confirmed[a]-confirmed[b]).slice(0,keys.length-10000)) delete confirmed[id];
      if(changed) save();
      const hidden=who?hiddenIds([...records.values()],who,root,Object.keys(confirmed)):new Set();
      let count=0;
      const active=state.enabled && !!who;
      for(const a of articles) {
        const id=articleId(a);if(!id || id===root) continue;
        if(active && (hidden.has(id) || articleAuthor(a)===who)) {desired.add(safeCell(a));count++;}
      }
      if(active) for(const button of column.querySelectorAll('button,[role="button"],a[href]')) {
        if(button.closest('#xuf-panel, article')) continue;
        const label=(button.textContent || '').trim().replace(/\s+/g,' ');
        if(/^(?:显示(?:更多)?回复|查看(?:更多)?回复|顯示(?:更多)?回[覆復]|Show (?:more )?replies|View (?:more )?replies)(?:\s*[（(]?\d+[）)]?)?$/i.test(label)) {
          const cell=safeCell(button);
          desired.add(cell.querySelector('article')?button:cell);
        }
      }
      toggle.disabled=!who;
      const t=text();
      panel.lang=XUF_I18N.current()==='zh'?'zh-CN':'en';
      panel.querySelector('summary').textContent=t.settings;
      panel.querySelector('.xuf-username').textContent=t.username;
      panel.querySelector('p').textContent=t.help;
      panel.querySelector('.xuf-reset').textContent=t.clear;
      input.placeholder=t.placeholder;
      if(input.validity.customError) input.setCustomValidity(t.invalid);
      toggle.textContent=state.enabled?t.show:t.hide;
      toggle.setAttribute('aria-pressed',String(state.enabled));
      status.textContent=who?`@${who} · ${state.enabled?t.hidden(count):t.all}`:t.missing;
    } else panel?.remove();
    for(const el of document.querySelectorAll('[data-xuf-hidden]')) if(!desired.has(el)) el.removeAttribute('data-xuf-hidden');
    for(const el of desired) if(!el.hasAttribute('data-xuf-hidden')) el.setAttribute('data-xuf-hidden','true');
  }
  chrome.storage.local.get('xufState').then(data=>{
    const s=data.xufState;
    if(s && typeof s==='object') state={enabled:!!s.enabled,override:norm(s.override),confirmed:s.confirmed || {}};
    ready=true;schedule();
  });
  new MutationObserver(mutations=>{
    if(mutations.some(m=>!m.target.closest?.('#xuf-panel') && (m.type==='attributes' || m.addedNodes.length || m.removedNodes.length))) schedule();
  }).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['lang']});
  let path=location.pathname;
  setInterval(()=>{if(path!==location.pathname){path=location.pathname;schedule();}},700);
})();
