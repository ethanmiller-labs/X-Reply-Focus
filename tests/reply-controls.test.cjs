const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test: nodeTest } = require('node:test');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'core.js'), 'utf8'), context);
const { isReplyExpansion, hiddenTarget, ReplyExpander } = context.XUF_REPLIES;
const cases = [];
const test = (name, run) => cases.push({name, run});
function control(label='显示回复') {
  return {textContent: label, disabled:false, isConnected:true, clicks:0,
    closest:()=>null, getAttribute:()=>null, getClientRects:()=>[{}], click(){this.clicks++}};
}
function harness(buttons, options={}) {
  let runnable=true, next=0;const pending=new Map();
  const column={querySelectorAll:()=>buttons,contains:b=>buttons.includes(b)};
  const timers={setTimeout:fn=>{pending.set(++next,fn);return next},clearTimeout:id=>pending.delete(id)};
  let updates=0;
  const queue=new ReplyExpander({canRun:()=>runnable,onExpanded:()=>updates++,timers,...options});
  return {queue,column,pending,setRunnable:v=>runnable=v,updates:()=>updates,
    flush(){const first=pending.entries().next().value;if(first){pending.delete(first[0]);first[1]()}}};
}
test('Chinese and English expansion controls are recognized without matching reply actions',()=>{
  for(const label of ['显示回复','显示更多回复','Show replies','Show more replies','View replies','顯示更多回覆'])
    assert.equal(isReplyExpansion(control(label)),true);
  for(const label of ['回复','Reply','Show more','显示更多','Post','喜欢'])
    assert.equal(isReplyExpansion(control(label)),false);
});
test('regular reply buttons inside an article are excluded',()=>{
  const b=control();b.closest=()=>({});assert.equal(isReplyExpansion(b),false);
});
test('an expansion control sharing a cell with a hidden article remains accessible',()=>{
  const b=control();const article={closest:()=>cell};
  const cell={querySelector:()=>null,querySelectorAll:selector=>selector.startsWith('article')?[article]:[b]};
  assert.equal(hiddenTarget(article),article);
  cell.querySelectorAll=selector=>selector.startsWith('article')?[article]:[];
  assert.equal(hiddenTarget(article),cell);
});
test('automatic expansion runs only when filtering is enabled',()=>{
  const b=control(),h=harness([b]);h.queue.update(h.column,'owner:1',false);assert.equal(h.pending.size,0);
  h.queue.update(h.column,'owner:1',true);h.flush();assert.equal(b.clicks,1);assert.equal(h.updates(),1);
});
test('a persistent expansion control is not clicked repeatedly',()=>{
  const b=control(),h=harness([b]);h.queue.update(h.column,'owner:1',true);h.flush();
  h.queue.update(h.column,'owner:1',true);assert.equal(h.pending.size,0);assert.equal(b.clicks,1);
});
test('turning the filter off cancels pending expansion',()=>{
  const b=control(),h=harness([b]);h.queue.update(h.column,'owner:1',true);
  h.queue.update(h.column,'owner:1',false);h.flush();assert.equal(b.clicks,0);
});
test('opening a reply dialog or leaving the page pauses a queued expansion',()=>{
  const b=control(),h=harness([b]);h.queue.update(h.column,'owner:1',true);h.setRunnable(false);h.flush();
  assert.equal(b.clicks,0);h.setRunnable(true);h.queue.update(h.column,'owner:1',true);h.flush();assert.equal(b.clicks,1);
});
test('expansion respects its budget and a new filter activation resets it',()=>{
  const a=control(),b=control(),h=harness([a,b],{limit:1});h.queue.update(h.column,'owner:1',true);h.flush();
  h.queue.update(h.column,'owner:1',true);assert.equal(h.pending.size,0);assert.equal(b.clicks,0);
  h.queue.update(h.column,'owner:1',false);h.queue.update(h.column,'owner:1',true);h.flush();assert.equal(a.clicks,2);
});
test('same follower second message revealed by expansion is not hidden with the first',()=>{
  const rows=[{id:'11',author:'fan',parent:'1'},{id:'12',author:'owner',parent:'11'},
    {id:'13',author:'fan',parent:'12'}];
  assert.deepEqual([...context.XUF.hiddenIds(rows,'owner','1',[])].sort(),['11','12']);
});
if(require.main===module) for(const item of cases) nodeTest(item.name,item.run);
module.exports=cases;
