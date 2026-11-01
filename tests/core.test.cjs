const { test: nodeTest } = require('node:test');
const cases = [];
const test = (name, run) => cases.push({ name, run });
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'core.js'), 'utf8'), context);
const { resolvePostContext, hiddenIds, isOwnPost } = context.XUF;
const post = () => resolvePostContext('/HeyCuriousBear/status/100', null, false, false);

test('reply composer keeps the original post on the same background timeline', () => {
  const original = post();
  for (const route of ['/compose/post', '/compose/tweet', '/compose/post/']) {
    const modal = resolvePostContext(route, original, true, true);
    assert.equal(modal.root, '100');
    assert.equal(modal.author, 'heycuriousbear');
  }
});
test('opening, rerendering and closing the composer keeps the same hidden IDs', () => {
  const rows = [{ id: '101', author: 'fan', parent: '100' },
    { id: '102', author: 'heycuriousbear', parent: '101' },
    { id: '103', author: 'fan', parent: '102' }];
  let current = post();
  for (const route of ['/compose/post', '/compose/post', '/HeyCuriousBear/status/100']) {
    current = resolvePostContext(route, current, route.startsWith('/compose/'), true);
    assert.deepEqual([...hiddenIds(rows, 'heycuriousbear', current.root, [])].sort(), ['101', '102']);
  }
});
test('a successful reply response hides the answered comment but keeps a later fan message', () => {
  const current = resolvePostContext('/compose/post', post(), true, true);
  const response = { data: { create_tweet: { tweet_results: { result: {
    rest_id: '104', legacy: { full_text: 'Thanks!', in_reply_to_status_id_str: '103' },
    core: { user_results: { result: { core: { screen_name: 'HeyCuriousBear' } } } }
  } } } } };
  const replies = context.XUF.extract(response);
  const rows = [{id: '103', author: 'fan', parent: '100'}, ...replies,
    {id: '105', author: 'fan', parent: '104'}];
  assert.deepEqual([...hiddenIds(rows, 'heycuriousbear', current.root, [])].sort(), ['103', '104']);
});
test('a composer without a known background post does not inherit a filter', () => {
  assert.equal(resolvePostContext('/compose/post', null, true, true), null);
});
test('a standalone compose page does not reuse the previous timeline', () => {
  assert.equal(resolvePostContext('/compose/post', post(), true, false), null);
  assert.equal(resolvePostContext('/compose/post', post(), false, true), null);
});
test('unrelated pages clear the post context even with a dialog open', () => {
  for (const route of ['/home', '/notifications', '/HeyCuriousBear', '/settings'])
    assert.equal(resolvePostContext(route, post(), true, true), null);
});
test('another post supersedes the previous context and fails the own-post guard', () => {
  const next = resolvePostContext('/JackWuvs/status/200', post(), true, true);
  assert.equal(next.root, '200');
  assert.equal(isOwnPost(next.author, 'heycuriousbear'), false);
});
test('own-post context does not depend on the focal article remaining mounted', () => {
  const current = resolvePostContext('/HeyCuriousBear/status/100', null, false, false);
  assert.equal(isOwnPost(current.author, 'heycuriousbear'), true);
});
test('main post is never hidden, even when saved reply history includes it', () => {
  assert.deepEqual([...hiddenIds([], 'heycuriousbear', '100', ['100'])], []);
});

// Minimal DOM fixtures exercise timestamp selection independently of X markup classes.
function articleWithTimes(specs) {
  const article={};
  const times=specs.map(spec => {
    const link=spec.href?{getAttribute:()=>spec.href,querySelector:()=>spec.wrapsQuote?{}:null}:null;
    return {closest: selector => selector==='article'?(spec.nested?{}:article):selector==='a[href]'?link:spec.quoted?{}:null};
  });
  article.querySelectorAll=()=>times;
  return article;
}
test('unlinked quoted timestamp before the main timestamp does not hide the panel', () => {
  const a=articleWithTimes([{href:null},{href:'/HeyCuriousBear/status/2116766232733245617'}]);
  const identity=context.XUF.articleIdentity(a);
  assert.equal(identity.id,'2116766232733245617');
  assert.equal(identity.author,'heycuriousbear');
});
test('a nested quoted article or role-link card cannot supply the outer identity', () => {
  const a=articleWithTimes([{href:'/quoted/status/10',nested:true},
    {href:'/quoted/status/11',quoted:true},{href:'/quoted/status/12',wrapsQuote:true},
    {href:'/owner/status/100'}]);
  assert.equal(context.XUF.articleIdentity(a).id,'100');
});
test('normal comment timestamp still resolves when followed by a quoted timestamp', () => {
  const a=articleWithTimes([{href:'/fan/status/200'},{href:'/quoted/status/300',quoted:true}]);
  assert.equal(context.XUF.articleIdentity(a).author,'fan');
});
test('media and analytics links cannot be mistaken for the main permalink', () => {
  const a=articleWithTimes([{href:'/owner/status/100/photo/1'},
    {href:'/owner/status/100/analytics'},{href:'/owner/status/100'}]);
  assert.equal(context.XUF.articleIdentity(a).id,'100');
});
test('no valid outer permalink returns no identity', () => {
  assert.equal(context.XUF.articleIdentity(articleWithTimes([{href:null}])),null);
});

if (require.main === module) for (const item of cases) nodeTest(item.name, item.run);
module.exports = cases;
