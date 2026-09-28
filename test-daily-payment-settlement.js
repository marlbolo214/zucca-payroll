'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('./index.html','utf8');
const from=html.indexOf('function settleDailyPayments(');
const to=html.indexOf('function summarize(',from);
assert.ok(from>0&&to>from);
const ctx={iso:d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
vm.createContext(ctx);
vm.runInContext(html.slice(from,to),ctx);
const start=new Date(2026,8,21),end=new Date(2026,9,20);
const row=(staff_name,work_date,paid_at,paid_amount,_storeId='zucca')=>({staff_name,work_date,paid_at,paid_amount,_storeId});
const settle=rows=>ctx.settleDailyPayments(rows,'アスカ','zucca',start,end,116141);

assert.equal(settle([]).transfer,116141);
assert.equal(settle([row('アスカ','2026-09-28',null,null)]).transfer,116141);
assert.equal(settle([row('アスカ','2026-09-28','2026-09-28T11:00:00Z',10000)]).transfer,106141);
assert.equal(settle([row('アスカ','2026-09-28','2026-09-28T11:00:00Z',0)]).transfer,null);
assert.equal(settle([row('アスカ','2026-09-28','2026-09-28T11:00:00Z',null)]).transfer,null);
assert.match(settle([row('アスカ','2026-09-28','2026-09-28T11:00:00Z',null)]).transferIssue,/支払額が未登録/);
assert.equal(settle([row('アスカ','2026-09-28','2026-09-28T11:00:00Z',120000)]).transfer,null);
assert.match(settle([row('アスカ','2026-09-28','2026-09-28T11:00:00Z',120000)]).transferIssue,/超えています/);
assert.equal(settle([
  row('アスカ','2026-09-28','2026-09-28T11:00:00Z',10000),
  row('アスカ','2026-10-21','2026-10-21T11:00:00Z',10000),
  row('アスカ','2026-09-29','2026-09-29T11:00:00Z',10000,'takanekodan'),
  row('チノ','2026-09-29','2026-09-29T11:00:00Z',10000)
]).transfer,106141);
console.log('daily payment settlement: 8 cases passed');
