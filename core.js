(() => {
  const norm = value => String(value || '').replace(/^@/, '').trim().toLowerCase();
  function extract(data) {
    const found = new Map(), seen = new WeakSet();
    function walk(n) {
      if (!n || typeof n !== 'object' || seen.has(n)) return;
      seen.add(n);
      const l = n.legacy, u = n.core?.user_results?.result;
      const author = u?.legacy?.screen_name || u?.core?.screen_name;
      const id = n.rest_id || l?.id_str;
      if (l && /^\d+$/.test(id || '') && author && ('full_text' in l || 'in_reply_to_status_id_str' in l)) {
        found.set(id, {id, author:norm(author), parent:l.in_reply_to_status_id_str || null});
      }
      for (const value of Object.values(n)) walk(value);
    }
    walk(data); return [...found.values()];
  }
  function hiddenIds(records, account, root, confirmed) {
    const hidden = new Set(confirmed);
    for (const r of records) {
      if (r.author !== account || r.id === root) continue;
      // Hide our own replies, and only the exact comment we answered.
      // A fan's next message stays visible even when its parent is hidden.
      hidden.add(r.id);
      if (r.parent && r.parent !== root) hidden.add(r.parent);
    }
    hidden.delete(root);
    return hidden;
  }
  function articleIdentity(article) {
    for (const time of article.querySelectorAll('time')) {
      if (time.closest('article') !== article) continue;
      // Quote cards may contain an unlinked time, or a link wrapping the whole quote.
      const link=time.closest('a[href]');
      if (!link || link.querySelector('[data-testid="tweetText"]') || time.closest('div[role="link"], [data-testid="quoteTweet"]')) continue;
      const match=link.getAttribute('href')?.match(/^\/([A-Za-z0-9_]{1,15})\/status\/(\d+)\/?$/);
      if (match) return {id:match[2],author:norm(match[1])};
    }
    return null;
  }
  const isOwnPost = (author, account) => !!norm(account) && norm(author) === norm(account);
  function resolvePostContext(pathname, previous, hasDialog, sameTimeline) {
    const match=pathname.match(/^\/([A-Za-z0-9_]+)\/status\/(\d+)(?:\/|$)/);
    if(match) return {root:match[2],author:norm(match[1])};
    // X changes the URL while keeping the original timeline behind its composer.
    // Do not reuse a previous post on a standalone compose page or a new timeline.
    if(/^\/compose\/(?:post|tweet)\/?$/.test(pathname) && previous && hasDialog && sameTimeline)
      return {root:previous.root,author:previous.author};
    return null;
  }
  globalThis.XUF = {norm, extract, hiddenIds, isOwnPost, resolvePostContext, articleIdentity};
})();
(() => {
  function isReplyExpansion(control) {
    if(control.closest('#xuf-panel, article')) return false;
    const label=(control.textContent || '').trim().replace(/\s+/g,' ');
    return /^(?:显示(?:更多)?回复|查看(?:更多)?回复|顯示(?:更多)?回[覆復]|Show (?:more )?replies|View (?:more )?replies)(?:\s*[（(]?\d+[）)]?)?$/i.test(label);
  }
  const controlsIn=column => [...column.querySelectorAll('button,[role="button"]')].filter(isReplyExpansion);
  function hiddenTarget(article) {
    const cell=article.closest('[data-testid="cellInnerDiv"]');
    // Hide just the article if hiding its cell would also hide an expansion control.
    return cell && !cell.querySelector('#xuf-panel') && cell.querySelectorAll('article[data-testid="tweet"]').length===1 && !controlsIn(cell).length?cell:article;
  }
  function branchKey(control) {
    const cell=control.closest('[data-testid="cellInnerDiv"]');
    for(let sibling=cell?.previousElementSibling;sibling;sibling=sibling.previousElementSibling) {
      const article=sibling.querySelector('article[data-testid="tweet"]');
      const identity=article && XUF.articleIdentity(article);
      if(identity) return identity.id;
    }
    return null;
  }
  class ReplyExpander {
    constructor({onExpanded,canRun,delay=600,limit=30,timers=globalThis}) {
      Object.assign(this,{onExpanded,canRun,delay,limit,timers});this.key=null;this.timer=null;
    }
    update(column,key,enabled) {
      if(this.key!==key || !enabled) {
        if(this.timer!==null) this.timers.clearTimeout(this.timer);
        this.timer=null;this.key=enabled?key:null;
        this.clicked=new WeakSet();this.branches=new Set();this.count=0;
      }
      if(!enabled || !column || this.timer!==null || this.count>=this.limit || !this.canRun()) return;
      const candidate=controlsIn(column).find(button=>{
        const branch=branchKey(button);
        return !this.clicked.has(button) && (!branch || !this.branches.has(branch)) &&
          !button.disabled && button.getAttribute('aria-disabled')!=='true' && button.getClientRects().length;
      });
      if(!candidate) return;
      this.timer=this.timers.setTimeout(()=>{
        this.timer=null;
        if(!this.canRun() || !candidate.isConnected || !column.contains(candidate) || !isReplyExpansion(candidate)) return;
        this.clicked.add(candidate);const branch=branchKey(candidate);if(branch)this.branches.add(branch);
        this.count++;
        candidate.click();this.onExpanded();
      },this.delay);
    }
  }
  globalThis.XUF_REPLIES={isReplyExpansion,hiddenTarget,ReplyExpander};
})();
