(() => {
  if (window.__xufBridge) return; window.__xufBridge = true;
  function deliver(data) {
    // Pass only compact tweet relationships, never headers, cookies or full responses.
    const out=[], seen=new WeakSet();
    function walk(n) {
      if (!n || typeof n !== 'object' || seen.has(n)) return; seen.add(n);
      const l=n.legacy, u=n.core?.user_results?.result;
      const author=u?.legacy?.screen_name || u?.core?.screen_name;
      const id=n.rest_id || l?.id_str;
      if (l && /^\d+$/.test(id || '') && author && ('full_text' in l || 'in_reply_to_status_id_str' in l))
        out.push({id,author,parent:l.in_reply_to_status_id_str || null});
      for (const v of Object.values(n)) walk(v);
    }
    try { walk(data); if(out.length) window.postMessage({type:'XUF_RECORDS_V1',records:out}, location.origin); } catch {}
  }
  const relevant=url => { try { const u=new URL(url,location.href); return u.origin===location.origin && /\/(graphql|api)\//.test(u.pathname); } catch {return false;} };
  const originalFetch=window.fetch;
  window.fetch=function(...args) {
    const result=Reflect.apply(originalFetch,this,args);
    if(relevant(args[0]?.url || args[0])) result.then(r=>{if(r.ok) r.clone().json().then(deliver).catch(()=>{});}).catch(()=>{});
    return result;
  };
  const open=XMLHttpRequest.prototype.open, send=XMLHttpRequest.prototype.send, urls=new WeakMap();
  XMLHttpRequest.prototype.open=function(method,url,...rest) {urls.set(this,url); return Reflect.apply(open,this,[method,url,...rest]);};
  XMLHttpRequest.prototype.send=function(...args) {
    if(relevant(urls.get(this))) this.addEventListener('load',()=>{try {if(this.status>=200 && this.status<300) deliver(this.responseType==='json'?this.response:JSON.parse(this.responseText));} catch {}},{once:true});
    return Reflect.apply(send,this,args);
  };
})();