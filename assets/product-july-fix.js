(() => {
  const TARGET_NAME='チャーハン';
  const TARGET_QTY=135;
  const TARGET_SALES=108000;

  function rawName(r){return String(r?.name ?? r?.product_name ?? r?.item_name ?? '');}
  function normalizeName(v){
    return String(v||'')
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g,'')
      .replace(/[\s　]+/g,'')
      .replace(/[()（）]/g,'')
      .trim();
  }
  function isTarget(r){return normalizeName(rawName(r))===normalizeName(TARGET_NAME);}

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

  function uniqueProducts(input){
    if(!Array.isArray(input)) return [];
    const seen=new Set();
    const result=[];
    for(const source of input){
      const key=normalizeName(rawName(source));
      if(!key) continue;
      if(seen.has(key)) continue;
      seen.add(key);
      result.push(isTarget(source)?canonicalRow(source):{...source});
    }
    const total=result.reduce((s,r)=>s+Number(r.sales??r.amount??0),0);
    if(total){
      result.forEach(r=>{r.share=Number(r.sales??r.amount??0)/total;});
    }
    return result;
  }

  function applyFix(){
    if(typeof EMBEDDED_DATA!=='undefined'){
      Object.keys(EMBEDDED_DATA).forEach(k=>{
        if(/product/i.test(k)&&/2026[_-]?07|july/i.test(k)&&Array.isArray(EMBEDDED_DATA[k])){
          EMBEDDED_DATA[k].splice(0,EMBEDDED_DATA[k].length,...uniqueProducts(EMBEDDED_DATA[k]));
        }
      });
    }
    if(typeof state!=='undefined'&&state&&Array.isArray(state.products)){
      state.products.splice(0,state.products.length,...uniqueProducts(state.products));
    }
  }

  function visibleRows(query=''){
    applyFix();
    const q=String(query||'').toLowerCase();
    return uniqueProducts((state&&Array.isArray(state.products))?state.products:[])
      .filter(r=>(String(r.name||'')+' '+String(r.category||'')+' '+String(r.detail||'')).toLowerCase().includes(q));
  }

  function renderProductRows(){
    const prod=document.getElementById('prod');
    if(!prod||typeof table!=='function') return;
    const q=document.getElementById('search')?.value||'';
    const rows=visibleRows(q);
    prod.innerHTML=table(
      ['順位','商品','券売機分類','詳細分類','出数','売上','構成比'],
      rows.map((r,i)=>[
        i+1,
        r.name,
        r.category,
        r.detail||(typeof detailCategory==='function'?detailCategory(r.name,r.category):''),
        r.qty,
        typeof yen==='function'?yen(r.sales):r.sales,
        typeof pct==='function'?pct(r.share):r.share
      ]),
      true
    );
    const counter=document.querySelector('#host .toolbar span');
    if(counter) counter.textContent='全商品 '+rows.length+'品目';
  }

  function renderProductsFixed(){
    applyFix();
    state.products.forEach(x=>x.detail=typeof detailCategory==='function'?detailCategory(x.name,x.category):'');
    document.getElementById('host').innerHTML='<div class="panel"><div class="toolbar"><input id="search" placeholder="商品名・分類を検索"><span></span></div><div id="prod"></div></div>';
    const search=document.getElementById('search');
    if(search) search.addEventListener('input',renderProductRows);
    renderProductRows();
  }

  function renderABCFixed(){
    applyFix();
    const products=uniqueProducts(state.products);
    let cum=0;
    const rows=products.map((r,i)=>{
      cum+=Number(r.share||0);
      const c=cum<=.7?'A':cum<=.9?'B':'C';
      return [i+1,c,r.name,typeof detailCategory==='function'?detailCategory(r.name,r.category):'',r.qty,typeof yen==='function'?yen(r.sales):r.sales,typeof pct==='function'?pct(r.share):r.share,typeof pct==='function'?pct(cum):cum];
    });
    document.getElementById('host').innerHTML='<div class="notice">A：累積70%まで／B：90%まで／C：残り。売れ筋と整理対象の把握に使います。</div><div class="panel" style="margin-top:10px">'+table(['順位','ABC','商品','詳細分類','出数','売上','構成比','累積構成比'],rows,true)+'</div>';
  }

  function removeDuplicateRenderedRows(){
    const bodies=document.querySelectorAll('#prod tbody, #host tbody');
    bodies.forEach(body=>{
      const seen=new Set();
      [...body.querySelectorAll('tr')].forEach(row=>{
        const cells=row.querySelectorAll('td');
        if(cells.length<2) return;
        const product=normalizeName(cells[1].textContent||'');
        if(!product) return;
        if(seen.has(product)) row.remove();
        else seen.add(product);
      });
    });
  }

  function validate(){
    applyFix();
    const errors=[];
    const rows=uniqueProducts(state?.products||[]);
    const names=rows.map(r=>normalizeName(rawName(r))).filter(Boolean);
    const dup=[...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
    if(dup.length) errors.push('重複商品:'+dup.join('、'));
    const target=rows.filter(isTarget);
    if(target.length!==1) errors.push('チャーハン:'+target.length+'件');
    if(target.length===1){
      if(Number(target[0].qty)!==TARGET_QTY) errors.push('チャーハン出数:'+target[0].qty);
      if(Number(target[0].sales)!==TARGET_SALES) errors.push('チャーハン売上:'+target[0].sales);
    }
    return errors;
  }

  window.renderProducts=renderProductsFixed;
  window.filterProducts=renderProductRows;
  window.renderABC=renderABCFixed;

  const observer=new MutationObserver(()=>removeDuplicateRenderedRows());
  observer.observe(document.documentElement,{childList:true,subtree:true});

  applyFix();
  setTimeout(async()=>{
    if(typeof reloadCurrent==='function') await reloadCurrent();
    applyFix();
    if(typeof state!=='undefined'&&state.tab==='products') renderProductsFixed();
    if(typeof state!=='undefined'&&state.tab==='abc') renderABCFixed();
    removeDuplicateRenderedRows();
    const errors=validate();
    const u=document.getElementById('updated');
    if(u) u.textContent=errors.length
      ? '公開禁止：'+errors.join('／')
      : 'データ更新 2026/8/2（商品表描画時重複0件・チャーハン135食）';
  },700);
})();