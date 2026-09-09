'use strict';
const assert=require('node:assert/strict');
const {withholdingTax2027,salaryDeduction2027,basicDeduction2027}=require('./tax-2027');

// 356,000～358,999円の代表額357,500円に対する公式控除額。
assert.equal(salaryDeduction2027(357500),108167);
assert.equal(basicDeduction2027(357500),51667);

// 給与所得控除の最低保障額から30%算式へ移る境界。
assert.equal(salaryDeduction2027(169443),57500);
assert.equal(salaryDeduction2027(169444),57500);
assert.equal(salaryDeduction2027(169445),57501);

const cases=[
  ['甲・扶養0',0,110999,'kou',0],
  ['甲・扶養0',140,111000,'kou',0],
  ['甲・扶養0',140,112999,'kou',0],
  ['甲・扶養0',250,113000,'kou',0],
  ['甲・扶養0',250,114999,'kou',0],
  ['甲・扶養2',6860,356600,'kou',2],
  ['乙',3399,110999,'otsu',0],
  ['乙',4000,111000,'otsu',0],
  ['乙',4000,112999,'otsu',0],
  ['乙',4100,113000,'otsu',0],
  ['乙',4100,114999,'otsu',0],
  ['乙',259000,740000,'otsu',0],
  ['乙',259000,740001,'otsu',0],
  ['乙',659231,1719999,'otsu',0],
  ['乙',659300,1720000,'otsu',0],
  ['乙',659300,1720001,'otsu',0]
];
for(const [label,want,pay,kind,deps] of cases){
  assert.equal(withholdingTax2027(pay,kind,deps),want,`${label} ${pay}`);
}

// Every transition is checked on both sides; in-bracket values must be stable.
for(const [a,b] of [[111000,112999],[113000,114999],[221000,223999],[737000,739999]]){
  for(const kind of ['kou','otsu'])assert.equal(withholdingTax2027(a,kind,0),withholdingTax2027(b,kind,0));
}
console.log(`${cases.length} official examples and boundary sweeps passed`);
