(() => {
  const messages = {
    zh: {
      hide: '隐藏已回复', show: '显示全部', settings: '账号设置',
      username: '用户名（留空自动识别）', placeholder: '@用户名',
      help: '逐条判断评论。对方再次留言，只要你尚未回复，就会保留。自动展开当前已加载的折叠回复，也可手动点击“显示回复”。',
      clear: '清除本机识别记录', invalid: '请输入有效的 X 用户名',
      all: '显示全部评论', missing: '请在「账号设置」填写你的 X 用户名',
      hidden: count => `已隐藏 ${count} 条`
    },
    en: {
      hide: 'Hide replied', show: 'Show all', settings: 'Account settings',
      username: 'Username (leave blank to detect automatically)', placeholder: '@username',
      help: 'Each comment is checked separately. New messages stay visible until you reply to them. Loaded reply controls are expanded automatically. You can also click Show replies manually.',
      clear: 'Clear local reply history', invalid: 'Enter a valid X username',
      all: 'Showing all comments', missing: 'Enter your X username in Account settings',
      hidden: count => `${count} ${count === 1 ? 'comment' : 'comments'} hidden`
    }
  };
  function language(pageLanguage, bodyLanguage, browserLanguage) {
    const value=String(pageLanguage || bodyLanguage || browserLanguage || 'en').trim().toLowerCase();
    return /^zh(?:[-_]|$)/.test(value) ? 'zh' : 'en';
  }
  function current() {
    return language(document.documentElement?.getAttribute('lang'),document.body?.getAttribute('lang'),navigator.language);
  }
  globalThis.XUF_I18N={messages,language,current};
})();
