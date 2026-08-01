(() => {
  const TARGET_QTY = 135;
  const TARGET_SALES = 108000;

  function fixArray(arr){
    if(!Array.isArray(arr)) return false;
    let fixed=false;
    arr.forEach(r=>{
      const name=String(r.name||r.product_name||r.item_name||'');
      if(name.includes('チャーハン')){
        if('qty' in r) r.qty=TARGET_QTY;
        if('quantity' in r) r.quantity=TARGET_QTY;
        if('count' in r) r.count=TARGET_QTY;
        if('sales' in r) r.sales=TARGET_SALES;
        if('amount' in r) r.amount=TARGET_SALES;
        fixed=true;
      }
    });
    return fixed;
  }

  function applyFix(){
    if(typeof EMBEDDED_DATA!=='undefined'){
      Object.keys(EMBEDDED_DATA).forEach(k=>{
        if(/product/i.test(k) && /2026[_-]?07|july/i.test(k)) fixArray(EMBEDDED_DATA[k]);
      });
    }
    if(typeof state!=='undefined' && state){
      fixArray(state.products);
    }
  }

  const originalRenderProducts=window.renderProducts;
  window.renderProducts=function(){
    applyFix();
    return originalRenderProducts.apply(this,arguments);
  };

  const originalRenderABC=window.renderABC;
  window.renderABC=function(){
    applyFix();
    return originalRenderABC.apply(this,arguments);
  };

  const originalRenderBeer=window.renderBeer;
  window.renderBeer=function(){
    applyFix();
    return originalRenderBeer.apply(this,arguments);
  };

  setTimeout(async()=>{
    applyFix();
    if(typeof reloadCurrent==='function') await reloadCurrent();
    applyFix();
    if(typeof state!=='undefined' && ['products','abc','beer'].includes(state.tab)){
      if(state.tab==='products') window.renderProducts();
      if(state.tab==='abc') window.renderABC();
      if(state.tab==='beer') window.renderBeer();
    }
    const u=document.getElementById('updated');
    if(u) u.textContent='データ更新 2026/8/2（7月チャーハン135食・108,000円へ修正）';
  },300);
})();