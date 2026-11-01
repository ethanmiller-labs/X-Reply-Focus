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
  const isOwnPost = (author, account) => !!norm(account) && norm(author) === norm(account);
  globalThis.XUF = {norm, extract, hiddenIds, isOwnPost};
})();