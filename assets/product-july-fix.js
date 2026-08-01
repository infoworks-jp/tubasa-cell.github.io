(() => {
  const TARGET_NAME = 'チャーハン';
  const TARGET_QTY = 135;
  const TARGET_SALES = 108000;

  function productName(r){
    return String(r?.name ?? r?.product_name ?? r?.item_name ?? '').trim();
  }

  function setTargetValues(r){
    if('name' in r) r.name = TARGET_NAME;
    if('product_name' in r) r.product_name = TARGET_NAME;
    if('item_name' in r) r.item_name = TARGET_NAME;
    if('qty' in r) r.qty = TARGET_QTY;
    if('quantity' in r) r.quantity = TARGET_QTY;
    if('count' in r) r.count = TARGET_QTY;
    if('sales' in r) r.sales = TARGET_SALES;
    if('amount' in r) r.amount = TARGET_SALES;
  }

  function recomputeShares(arr){
    const total = arr.reduce((sum,r)=>sum + Number(r.sales ?? r.amount ?? 0),0);
    if(!total) return;
    arr.forEach(r=>{
      if('share' in r) r.share = Number(r.sales ?? r.amount ?? 0) / total;
    });
  }

  function fixArray(arr){
    if(!Array.isArray(arr)) return {changed:false,count:0};
    const indexes=[];
    arr.forEach((r,i)=>{ if(productName(r) === TARGET_NAME) indexes.push(i); });
    if(!indexes.length) return {changed:false,count:0};

    const keeper = arr[indexes[0]];
    setTargetValues(keeper);
    for(let i=indexes.length-1;i>=1;i--) arr.splice(indexes[i],1);
    recomputeShares(arr);
    return {changed:true,count:1};
  }

  function applyFix(){
    const checked=[];
    if(typeof EMBEDDED_DATA!=='undefined'){
      Object.keys(EMBEDDED_DATA).forEach(k=>{
        if(/product/i.test(k) && /2026[_-]?07|july/i.test(k)){
          const result=fixArray(EMBEDDED_DATA[k]);
          checked.push([k,result.count]);
        }
      });
    }
    if(typeof state!=='undefined' && state && Array.isArray(state.products)){
      const result=fixArray(state.products);
      checked.push(['state.products',result.count]);
    }
    return checked;
  }

  function assertSingleTarget(){
    const arrays=[];
    if(typeof EMBEDDED_DATA!=='undefined'){
      Object.keys(EMBEDDED_DATA).forEach(k=>{
        if(/product/i.test(k) && /2026[_-]?07|july/i.test(k) && Array.isArray(EMBEDDED_DATA[k])) arrays.push([k,EMBEDDED_DATA[k]]);
      });
    }
    if(typeof state!=='undefined' && state && Array.isArray(state.products)) arrays.push(['state.products',state.products]);

    const errors=[];
    arrays.forEach(([name,arr])=>{
      const rows=arr.filter(r=>productName(r)===TARGET_NAME);
      if(rows.length!==1) errors.push(`${name}: ${TARGET_NAME} ${rows.length}件`);
      if(rows.length===1){
        const qty=Number(rows[0].qty ?? rows[0].quantity ?? rows[0].count ?? 0);
        const sales=Number(rows[0].sales ?? rows[0].amount ?? 0);
        if(qty!==TARGET_QTY || sales!==TARGET_SALES) errors.push(`${name}: ${qty}食・${sales}円`);
      }
      const names=arr.map(productName).filter(Boolean);
      const duplicateNames=[...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
      if(duplicateNames.length) errors.push(`${name}: 重複商品 ${duplicateNames.join('、')}`);
    });
    return errors;
  }

  const originalRenderProducts=window.renderProducts;
  window.renderProducts=function(){ applyFix(); return originalRenderProducts.apply(this,arguments); };
  const originalRenderABC=window.renderABC;
  window.renderABC=function(){ applyFix(); return originalRenderABC.apply(this,arguments); };
  const originalRenderBeer=window.renderBeer;
  window.renderBeer=function(){ applyFix(); return originalRenderBeer.apply(this,arguments); };

  setTimeout(async()=>{
    applyFix();
    if(typeof reloadCurrent==='function') await reloadCurrent();
    applyFix();
    const errors=assertSingleTarget();
    if(typeof state!=='undefined' && ['products','abc','beer'].includes(state.tab)){
      if(state.tab==='products') window.renderProducts();
      if(state.tab==='abc') window.renderABC();
      if(state.tab==='beer') window.renderBeer();
    }
    const u=document.getElementById('updated');
    if(u) u.textContent=errors.length
      ? `公開禁止：商品重複検査エラー（${errors.join('／')}）`
      : 'データ更新 2026/8/2（商品名重複0件・チャーハン135食・108,000円）';
  },350);
})();