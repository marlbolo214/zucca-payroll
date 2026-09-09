(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ZuccaTax2027=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  // 国税庁「令和9年分 源泉徴収税額表」の電算機計算用月額。
  // 金額は年額を12で割った後の、同資料に記載された月額そのものを使う。
  function salaryDeduction(A){
    // 給与所得控除の最低保障額69万円 ÷ 12（月額57,500円）。
    if(A<=169443)return 57500;
    if(A<=299999)return Math.ceil(A*.30+6667);
    if(A<=549999)return Math.ceil(A*.20+36667);
    if(A<=708330)return Math.ceil(A*.10+91667);
    return 162500;
  }
  function basicDeduction(A){
    // 基礎控除62万円 ÷ 12。端数は資料指定どおり切上げ（月額51,667円）。
    if(A<=2120833)return 51667;
    if(A<=2162499)return 40000;
    if(A<=2204166)return 26667;
    if(A<=2245833)return 13334;
    return 0;
  }
  function normalIncomeTax(B){
    B=Math.max(0,B);
    if(B<=162500)return B*.05;
    if(B<=275000)return B*.10-8125;
    if(B<=579166)return B*.20-35625;
    if(B<=750000)return B*.23-53000;
    if(B<=1500000)return B*.33-128000;
    if(B<=3333333)return B*.40-233000;
    return B*.45-399666.5;
  }
  function round100(n){return Math.floor(n/100)*100+(n%100>=50?100:0)}
  function bracketAmount(A){
    if(A<=220999)return 112000+Math.floor((A-111000)/2000)*2000;
    if(A<=739999)return 222500+Math.floor((A-221000)/3000)*3000;
    return 740000;
  }
  function kou(A,dependents){
    // 月額表の最初の給与階級より少ない場合は税額なし。
    if(A<111000)return 0;
    A=bracketAmount(A);
    const dep=Math.max(0,Math.min(7,Math.trunc(Number(dependents)||0)));
    const B=Math.max(0,A-salaryDeduction(A)-basicDeduction(A)-31667*dep);
    return Math.max(0,Math.round(normalIncomeTax(B)*1.021/10)*10);
  }
  function otsu(A){
    if(A<111000)return Math.floor(A*.03063);
    if(A>740000){
      if(A<1720000)return Math.floor(259000+(A-740000)*.4084);
      return Math.floor(659200+(A-1720000)*.45945);
    }
    const C=bracketAmount(A);
    function part(multiplier){
      const X=C*multiplier;
      const B=Math.max(0,X-salaryDeduction(X)-basicDeduction(X));
      return Math.floor(normalIncomeTax(B));
    }
    return round100(round100(part(2.5)-part(1.5))*1.021);
  }
  function withholdingTax2027(amount,taxClass,dependents){
    const A=Math.max(0,Math.floor(Number(amount)||0));
    return taxClass==='otsu'||taxClass==='乙'?otsu(A):kou(A,dependents);
  }
  return {withholdingTax2027,salaryDeduction2027:salaryDeduction,basicDeduction2027:basicDeduction};
});
