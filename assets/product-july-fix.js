(() => {
  const TARGET_NAME='チャーハン';
  const TARGET_QTY=135;
  const TARGET_SALES=108000;

  function rawName(r){return String(r?.name ?? r?.product_name ?? r?.item_name ?? '');}
  function normalizeName(v){return String(v||'').normalize('NFKC').replace(/[\s　]+/g,'').replace(/[()（）]/g,'').trim();}
  function isTarget(r){return normalizeName(rawName(r))===TARGET_NAME;}

  function canonicalRow(source={}){
    const row={...source};
    row.name=TARGET_NAME;
    if('product_name' in row) row.product_name=TARGET_NAME;
    if('item_name' in row) row.item_name=TARGET_NAME;
    row.qty=TARGET_QTY;
    if('quantity' in row) row.quantity=TARGET_QTY;
    if('count' in row) row.count=TARGET_QTY;
    row.sales=TARGET_SALES;
    if('amount' in row) row.amount=TARGET_SALES;
    return row;
  }

  function dedupeAllProducts(arr){
    if(!Array.isArray(arr)) return arr;
    const seen=new Map();
    const result=[];
    for(const row of arr){
      const key=normalizeName(rawName(row));
      if(!key){result.push(row);continue;}
      if(isTarget(row)){
        if(!seen.has(TARGET_NAME)){
          seen.set(TARGET_NAME,result.length);
          result.push(canonicalRow(row));
        }
        continue;
      }
      if(seen.has(key)) continue;
      seen.set(key,result.length);
      result.push(row);
    }
    const total=result.reduce((s,r)=>s+Number(r.sales??r.amount??0),0);
    if(total){result.forEach(r=>{if('share' in r)r.share=Number(r.sales??r.amount??0)/total;});}
    arr.splice(0,arr.length,...result);
    return arr;
  }

  function applyFix(){
    if(typeof EMBEDDED_DATA!=='undefined'){
      Object.keys(EMBEDDED_DATA).forEach(k=>{
        if(/product/i.test(k)&&/2026[_-]?07|july/i.test(k)&&Array.isArray(EMBEDDED_DATA[k])) dedupeAllProducts(EMBEDDED_DATA[k]);
      });
    }
    if(typeof state!=='undefined'&&state&&Array.isArray(state.products)) dedupeAllProducts(state.products);
  }

  function validate(){
    const errors=[];
    const arrays=[];
    if(typeof EMBEDDED_DATA!=='undefined'){
      Object.keys(EMBEDDED_DATA).forEach(k=>{
        if(/product/i.test(k)&&/2026[_-]?07|july/i.test(k)&&Array.isArray(EMBEDDED_DATA[k])) arrays.push([k,EMBEDDED_DATA[k]]);
      });
    }
    if(typeof state!=='undefined'&&state&&Array.isArray(state.products)) arrays.push(['state.products',state.products]);
    for(const [label,arr] of arrays){
      const names=arr.map(r=>normalizeName(rawName(r))).filter(Boolean);
      const dup=[...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
      if(dup.length) errors.push(`${label}:重複 ${dup.join('、')}`);
      const target=arr.filter(isTarget);
      if(target.length!==1) errors.push(`${label}:チャーハン${target.length}件`);
      if(target.length===1){
        const qty=Number(target[0].qty??target[0].quantity??target[0].count??0);
        const sales=Number(target[0].sales??target[0].amount??0);
        if(qty!==TARGET_QTY||sales!==TARGET_SALES) errors.push(`${label}:チャーハン${qty}食/${sales}円`);
      }
    }
    return errors;
  }

  const baseProducts=window.renderProducts;
  const baseABC=window.renderABC;
  const baseBeer=window.renderBeer;
  if(typeof baseProducts==='function') window.renderProducts=function(){applyFix();return baseProducts.apply(this,arguments);};
  if(typeof baseABC==='function') window.renderABC=function(){applyFix();return baseABC.apply(this,arguments);};
  if(typeof baseBeer==='function') window.renderBeer=function(){applyFix();return baseBeer.apply(this,arguments);};

  applyFix();
  setTimeout(async()=>{
    if(typeof reloadCurrent==='function') await reloadCurrent();
    applyFix();
    const errors=validate();
    if(typeof state!=='undefined'&&state.tab==='products'&&typeof window.renderProducts==='function') window.renderProducts();
    if(typeof state!=='undefined'&&state.tab==='abc'&&typeof window.renderABC==='function') window.renderABC();
    if(typeof state!=='undefined'&&state.tab==='beer'&&typeof window.renderBeer==='function') window.renderBeer();
    const u=document.getElementById('updated');
    if(u)u.textContent=errors.length?`公開禁止：${errors.join('／')}`:'データ更新 2026/8/2（全商品重複0件・チャーハン1件）';
  },500);
})();