const assert=require('node:assert/strict');
const tax=require('../tax-2027.js');

for(const A of [0,100000,110999])assert.equal(tax.calculate(A,'kou',0),0);
for(const A of [111000,112999])assert.equal(tax.calculate(A,'kou',0),140);
for(const A of [113000,114999])assert.equal(tax.calculate(A,'kou',0),250);
assert.equal(tax.calculate(356600,'kou',2),6860);

assert.equal(tax.calculate(110999,'otsu',0),Math.floor(110999*.03063));
assert.equal(tax.calculate(111000,'otsu',0),4000);
assert.equal(tax.calculate(112999,'otsu',0),4000);
assert.equal(tax.calculate(113000,'otsu',0),4100);
assert.equal(tax.calculate(114999,'otsu',0),4100);

assert.equal(tax.salaryDeduction(169444),57500);
assert.equal(tax.basicDeduction(2120833),51667);
console.log('2027年源泉徴収テスト: OK');
