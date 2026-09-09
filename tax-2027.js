/* 令和9年分 源泉徴収税額の独立計算モジュール。
 * 2026年の計算コードとは共有せず、未対応年への流用もしない。
 */
(function(root, factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.ZuccaTax2027=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function salaryDeduction(A){
    if(A<=169444)return 57500;
    if(A<=299999)return Math.ceil(A*.30+6667);
    if(A<=549999)return Math.ceil(A*.20+36667);
    if(A<=708330)return Math.ceil(A*.10+91667);
    return 162500;
  }
  function basicDeduction(A){
    if(A<=2120833)return 51667;
    if(A<=2162499)return 40000;
    if(A<=2204166)return 26667;
    if(A<=2245833)return 13334;
    return 0;
  }
  function incomeTax(B){
    B=Math.max(0,B);
    if(B<=162500)return B*.05105;
    if(B<=275000)return B*.10210-8296;
    if(B<=579166)return B*.20420-36374;
    if(B<=750000)return B*.23483-54113;
    if(B<=1500000)return B*.33693-130688;
    if(B<=3333333)return B*.40840-237893;
    return B*.45945-408061;
  }
  function round100(n){return Math.round(n/100)*100}
  function kou(A,dependents){
    const dep=Math.max(0,Math.min(7,Number(dependents)||0));
    // 公表月額表の最初の三つの給与帯（表の境界値を優先）。
    if(dep===0&&A<=110999)return 0;
    if(dep===0&&A<=112999)return 140;
    if(dep===0&&A<=114999)return 250;
    // 公表電算機計算と月額表の基準差（833円）を課税給与所得へ反映する。
    const B=Math.max(0,A-salaryDeduction(A)-basicDeduction(A)-31667*dep+833);
    return Math.max(0,Math.round(incomeTax(B)/10)*10);
  }
  function otsu(A){
    if(A<111000)return Math.floor(A*.03063);
    if(A>740000){
      if(A<1720000)return Math.floor(259000+(A-740000)*.4084);
      return Math.floor(659300+(A-1720000)*.45945);
    }
    const step=A<=220999?2000:3000;
    const min=A<=220999?111000:221000;
    const base=A===740000?740000:A-((A-min)%step);
    function part(mult){
      const X=base*mult;
      const B=Math.max(0,X-salaryDeduction(X)-basicDeduction(X));
      return Math.floor(incomeTax(B)/1.021);
    }
    return round100(round100(part(2.5)-part(1.5))*1.021);
  }
  function calculate(amount,taxClass,dependents){
    const A=Math.max(0,Math.floor(Number(amount)||0));
    return taxClass==='otsu'||taxClass==='乙'?otsu(A):kou(A,dependents);
  }
  return {calculate,salaryDeduction,basicDeduction,incomeTax};
});
