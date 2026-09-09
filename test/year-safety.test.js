const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');

assert.match(html,/taxYear===2026 \? withholdingTax2026/);
assert.match(html,/taxYear===2027 \? ZuccaTax2027\.calculate/);
assert.match(html,/const taxSupported=\(taxYear===2026\|\|taxYear===2027\)/);
assert.match(html,/const taxYear=Number\(adjustment\.paymentDate\.slice\(0,4\)\)/);
assert.doesNotMatch(html,/taxYear >= 2027 \? withholdingTax2026/);
console.log('年度選択・未対応年度停止テスト: OK');
