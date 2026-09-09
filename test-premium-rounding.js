'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('./index.html','utf8');
const start=html.indexOf('function roundWageToYen');
const end=html.indexOf('function readTaxSettings',start);
assert.notEqual(start,-1);
assert.notEqual(end,-1);

const context={};
vm.createContext(context);
vm.runInContext(html.slice(start,end),context);

// 50銭未満は切り捨て、50銭以上は切り上げる。
for(const [amount,expected] of [
  [1218.49,1218],
  [1218.50,1219],
  [1218.75,1219],
  [812.49,812],
  [812.50,813]
]){
  assert.equal(context.roundWageToYen(amount),expected,`${amount}円の端数処理`);
}

// 実例の各表示項目は確定済みの円額で、合計が支給額と一致する。
const pay=context.calculatePayAmounts(1300,67*60,3.75*60,2.5*60,11952);
assert.deepEqual(
  JSON.parse(JSON.stringify(pay)),
  {base:87100,otPremium:1219,nightPremium:813,transport:11952,total:101084}
);
assert.equal(pay.base+pay.otPremium+pay.nightPremium+pay.transport,pay.total);

console.log('5 rounding boundaries and payroll total consistency passed');
