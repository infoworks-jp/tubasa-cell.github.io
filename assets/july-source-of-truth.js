(() => {
  const JULY = Object.freeze({
    month:'2026-07', sales:4917050, customers:3525, days:27,
    issued:5048, settlement:-53, net:4995,
    products:[
      ['究極の味噌ラーメン',1100,1891,-20,2058100],
      ['バターコーンラーメン味噌',1400,456,-1,637000],
      ['チャーシュー麺味噌',1450,120,0,174000],
      ['ネギたっぷりラーメン味噌',1300,88,0,114400],
      ['ピリ辛ネギラーメン味噌',1300,108,0,140400],
      ['キムチラーメン味噌',1250,17,0,21250],
      ['ラーメン醤油',980,138,-2,133280],
      ['バターコーンラーメン醤油',1300,23,0,29900],
      ['チャーシュー麺醤油',1350,25,0,33750],
      ['ネギたっぷりラーメン醤油',1180,14,0,16520],
      ['ピリ辛ネギラーメン醤油',1180,21,-1,23600],
      ['キムチラーメン醤油',1130,1,0,1130],
      ['ラーメン塩',980,136,-1,132300],
      ['バターコーンラーメン塩',1300,27,0,35100],
      ['チャーシュー麺塩',1350,10,-1,12150],
      ['ネギたっぷりラーメン塩',1180,24,0,28320],
      ['ピリ辛ネギラーメン塩',1180,13,0,15340],
      ['キムチラーメン塩',1130,2,0,2260],
      ['味噌＋餃子セット',1450,123,0,178350],
      ['醤油＋餃子セット',1400,10,0,14000],
      ['塩＋餃子セット',1400,6,0,8400],
      ['大盛り',200,120,-2,23600],
      ['トッピングチャーシュー',450,22,0,9900],
      ['辛みそラーメン（期間限定）',1200,54,-1,63600],
      ['お子様ハーフ味噌',700,147,0,102900],
      ['お子様ハーフ醤油',650,26,0,16900],
      ['お子様ハーフ塩',650,21,0,13650],
      ['キムチわかめたまご',150,23,0,3450],
      ['バター・コーン',200,78,-1,15400],
      ['ねぎ・ピリ辛ねぎ',200,33,0,6600],
      ['ライス大',200,48,-2,9200],
      ['ライス小',150,89,-1,13200],
      ['チャーハン',800,135,0,108000],
      ['餃子（1皿6個）',500,233,-17,108000],
      ['お土産ラーメン',700,24,0,16800],
      ['生ビール',600,291,0,174600],
      ['瓶ビール',700,281,-3,194600],
      ['冷酒',700,11,0,7700],
      ['ジュース コーラ',300,58,0,17400],
      ['つばさラーメン',2000,101,0,202000]
    ]
  });

  const normalize=s=>String(s||'').normalize('NFKC').replace(/[\s　]+/g,'').trim();
  const category=name=>/ビール|冷酒|ジュース/.test(name)?'飲料':/セット/.test(name)?'セット':/餃子|チャーハン|ライス|大盛り|トッピング|バター・コーン|ねぎ|キムチわかめ|お土産/.test(name)?'サイド・トッピング':'ラーメン';
  const products=JULY.products.map((r,i)=>({
    rank:i+1,name:r[0],price:r[1],issued_count:r[2],settlement_count:r[3],qty:r[2]+r[3],sales:r[4],category:category(r[0])
  }));
  const sum=(a,k)=>a.reduce((s,x)=>s+Number(x[k]||0),0);
  products.forEach(x=>x.share=x.sales/JULY.sales);

  const checks=()=>{
    const errors=[];
    if(products.length!==40) errors.push(`商品数${products.length}`);
    if(new Set(products.map(x=>normalize(x.name))).size!==40) errors.push('商品名重複');
    if(sum(products,'issued_count')!==JULY.issued) errors.push(`発行${sum(products,'issued_count')}`);
    if(sum(products,'settlement_count')!==JULY.settlement) errors.push(`精算${sum(products,'settlement_count')}`);
    if(sum(products,'qty')!==JULY.net) errors.push(`正味${sum(products,'qty')}`);
    if(sum(products,'sales')!==JULY.sales) errors.push(`売上${sum(products,'sales')}`);
    const c=products.filter(x=>x.name==='チャーハン');
    if(c.length!==1||c[0].qty!==135||c[0].sales!==108000) errors.push('チャーハン');
    return errors;
  };

  function apply(){
    if(typeof state!=='undefined' && state.month==='2026-07'){
      state.products=products.map(x=>({...x}));
      state.overview={...(state.overview||{}),month:'2026-07',month_sales:JULY.sales,month_customers:JULY.customers,month_days:JULY.days,avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers};
      if(Array.isArray(state.monthly)){
        const m=state.monthly.find(x=>x.month==='2026-07');
        if(m) Object.assign(m,{sales:JULY.sales,customers:JULY.customers,days:JULY.days,avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers});
      }
    }
    if(typeof EMBEDDED_DATA!=='undefined'){
      EMBEDDED_DATA.products_2026_07=products.map(x=>({...x}));
      EMBEDDED_DATA.july_monthly_source={...JULY,products:undefined};
    }
  }

  const originalReload=window.reloadCurrent;
  if(typeof originalReload==='function') window.reloadCurrent=async function(){const v=await originalReload.apply(this,arguments);apply();return v;};

  window.renderProducts=function(){
    apply();
    const rows=products.map((r,i)=>[i+1,r.name,yen(r.price),r.issued_count,r.settlement_count,r.qty,yen(r.sales),pct(r.share)]);
    $('host').innerHTML=`<div class="notice ok"><b>7月月間ジャーナル原本40品目を直接表示。</b> 出数は「発行数＋精算数＝正味出数」です。</div><div class="panel" style="margin-top:12px"><div class="toolbar"><input id="search" placeholder="商品名を検索" oninput="window.filterJulyProducts()"><span>全40品目</span></div><div id="prod">${table(['順位','商品','単価','発行数','精算数','正味出数','売上','構成比'],rows,true)}</div></div>`;
  };
  window.filterJulyProducts=function(){
    const q=normalize(document.getElementById('search')?.value||'');
    const arr=products.filter(r=>normalize(r.name).includes(q));
    const rows=arr.map((r,i)=>[i+1,r.name,yen(r.price),r.issued_count,r.settlement_count,r.qty,yen(r.sales),pct(r.share)]);
    document.getElementById('prod').innerHTML=table(['順位','商品','単価','発行数','精算数','正味出数','売上','構成比'],rows,true);
  };
  window.renderABC=function(){
    apply(); let cum=0;
    const sorted=[...products].sort((a,b)=>b.sales-a.sales);
    const rows=sorted.map((r,i)=>{cum+=r.share;const c=cum<=.7?'A':cum<=.9?'B':'C';return[i+1,c,r.name,r.qty,yen(r.sales),pct(r.share),pct(cum)]});
    $('host').innerHTML=`<div class="notice ok"><b>7月月間原本40品目から自動計算。</b></div><div class="panel" style="margin-top:12px">${table(['順位','ABC','商品','正味出数','売上','構成比','累積構成比'],rows,true)}</div>`;
  };
  window.renderBeer=function(){
    apply();
    const beer=products.filter(r=>/ビール/.test(r.name)),sets=products.filter(r=>/セット/.test(r.name)),gyoza=products.filter(r=>/餃子/.test(r.name));
    const sy=a=>sum(a,'sales'),sq=a=>sum(a,'qty');
    $('host').innerHTML=`<div class="cards"><div class="card"><div>ビール売上</div><div class="big">${yen(sy(beer))}</div></div><div class="card"><div>ビール正味出数</div><div class="big">${sq(beer)}本</div></div><div class="card"><div>セット売上</div><div class="big">${yen(sy(sets))}</div></div><div class="card"><div>餃子関連売上</div><div class="big">${yen(sy(gyoza))}</div></div></div><div class="grid2" style="margin-top:12px"><div class="panel"><h3>ビール商品</h3>${table(['商品','発行','精算','正味','売上'],beer.map(r=>[r.name,r.issued_count,r.settlement_count,r.qty,yen(r.sales)]))}</div><div class="panel"><h3>セット商品</h3>${table(['商品','正味出数','売上'],sets.map(r=>[r.name,r.qty,yen(r.sales)]))}</div></div>`;
  };

  apply();
  setTimeout(async()=>{
    if(typeof window.reloadCurrent==='function') await window.reloadCurrent();
    apply();
    const errors=checks();
    const u=document.getElementById('updated');
    if(u)u.textContent=errors.length?`公開禁止：${errors.join('／')}`:'7月原本検算済：40品目・発行5,048・精算−53・正味4,995・売上4,917,050円';
    if(typeof state!=='undefined'&&state.tab==='products')window.renderProducts();
    if(typeof state!=='undefined'&&state.tab==='abc')window.renderABC();
    if(typeof state!=='undefined'&&state.tab==='beer')window.renderBeer();
  },800);
})();