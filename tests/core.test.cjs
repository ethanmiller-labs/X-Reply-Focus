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

if (require.main === module) for (const item of cases) nodeTest(item.name, item.run);
module.exports = cases;
