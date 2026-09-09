'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('./index.html','utf8');
const start=html.indexOf('function salaryDeduction2026');
const end=html.indexOf('function readTaxSettings');
assert.notEqual(start,-1);
assert.notEqual(end,-1);
const context={window:{ZuccaTax2027:require('./tax-2027')}};
vm.createContext(context);
vm.runInContext(html.slice(start,end),context);

// 2026年の既存計算の回帰値（甲欄・乙欄・扶養控除・境界）。
const cases2026=[
  [104999,'kou',0,130],
  [105000,'kou',0,130],
  [356600,'kou',2,6990],
  [104999,'otsu',0,3216],
  [105000,'otsu',0,3800],
  [740000,'otsu',0,259200],
  [1710000,'otsu',0,655400]
];
for(const [pay,taxClass,deps,want] of cases2026){
  assert.equal(context.withholdingTaxForYear(2026,pay,taxClass,deps),want,`2026 ${taxClass} ${pay}`);
}

// 支払年による正式ロジックの切替と、未対応年の安全停止。
assert.equal(context.withholdingTaxForYear(2027,356600,'kou',2),6860);
assert.equal(context.withholdingTaxForYear(2027,111000,'otsu',0),4000);

// 2027年の組み込み正式版はクラウド接続・マスター照会より先に表示判定する。
const localBadge=html.indexOf("if(year === 2027 && typeof window.ZuccaTax2027?.withholdingTax2027 === 'function')");
const cloudGate=html.indexOf('if(!session || !session.access_token)',localBadge);
assert.ok(localBadge>=0 && cloudGate>localBadge);
assert.match(html.slice(localBadge,cloudGate),/組み込み正式版/);
assert.equal(context.withholdingTaxForYear(2028,356600,'kou',2),null);
context.window.ZuccaTax2027=undefined;
assert.equal(context.withholdingTaxForYear(2027,356600,'kou',2),null);

// 交通費と社会保険料等は課税対象から除外する。
assert.equal(context.taxablePay(400000,15000,50000),335000);
assert.equal(context.taxablePay(40000,15000,50000),0);
console.log(`${cases2026.length} 2026 regression cases and year-routing checks passed`);
