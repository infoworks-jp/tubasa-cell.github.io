(() => {
  'use strict';

  const JUNE = Object.freeze({month:'2026-06',sales:4995250,customers:3587,days:28});
  const JULY = Object.freeze({
    month:'2026-07',sales:4917050,customers:3525,days:27,
    issued:5048,settlement:-53,net:4995,
    dailyRegisteredSales:4949740,dailyRegisteredCustomers:3585,
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

  const clone=v=>JSON.parse(JSON.stringify(v));
  const normalize=s=>String(s||'').normalize('NFKC').replace(/[\s　]+/g,'').trim();
  const category=name=>/ビール|冷酒|ジュース/.test(name)?'飲料':/セット/.test(name)?'セット':/餃子|チャーハン|ライス|大盛り|トッピング|バター・コーン|ねぎ|キムチわかめ|お土産/.test(name)?'サイド・トッピング':'ラーメン';
  const products=JULY.products.map((r,i)=>({rank:i+1,name:r[0],price:r[1],issued_count:r[2],settlement_count:r[3],qty:r[2]+r[3],sales:r[4],category:category(r[0])}));
  const sum=(a,k)=>a.reduce((s,x)=>s+Number(x[k]||0),0);
  products.forEach(x=>x.share=x.sales/JULY.sales);

  const totalSales=JUNE.sales+JULY.sales;
  const totalCustomers=JUNE.customers+JULY.customers;
  const totalDays=JUNE.days+JULY.days;

  const julyOverview=()=>({
    month:JULY.month,total_sales:totalSales,total_customers:totalCustomers,total_days:totalDays,
    month_sales:JULY.sales,month_customers:JULY.customers,month_days:JULY.days,
    avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers,
    projection:JULY.sales,month_count:2,avg_monthly:totalSales/2,
    avg_customers_per_day:JULY.customers/JULY.days
  });
  const allOverview=()=>({
    month:'all',total_sales:totalSales,total_customers:totalCustomers,total_days:totalDays,
    month_sales:totalSales,month_customers:totalCustomers,month_days:totalDays,
    avg_daily:totalSales/totalDays,avg_spend:totalSales/totalCustomers,
    projection:0,month_count:2,avg_monthly:totalSales/2,
    avg_customers_per_day:totalCustomers/totalDays
  });
  const monthlyRows=()=>[
    {month:JUNE.month,sales:JUNE.sales,customers:JUNE.customers,days:JUNE.days,avg_daily:JUNE.sales/JUNE.days,avg_spend:JUNE.sales/JUNE.customers},
    {month:JULY.month,sales:JULY.sales,customers:JULY.customers,days:JULY.days,avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers}
  ];

  function checks(){
    const errors=[];
    if(products.length!==40)errors.push(`商品数${products.length}`);
    if(new Set(products.map(x=>normalize(x.name))).size!==40)errors.push('商品名重複');
    if(sum(products,'issued_count')!==JULY.issued)errors.push(`発行${sum(products,'issued_count')}`);
    if(sum(products,'settlement_count')!==JULY.settlement)errors.push(`精算${sum(products,'settlement_count')}`);
    if(sum(products,'qty')!==JULY.net)errors.push(`正味${sum(products,'qty')}`);
    if(sum(products,'sales')!==JULY.sales)errors.push(`商品売上${sum(products,'sales')}`);
    const c=products.filter(x=>x.name==='チャーハン');
    if(c.length!==1||c[0].issued_count!==135||c[0].settlement_count!==0||c[0].qty!==135||c[0].sales!==108000)errors.push('チャーハン');
    return errors;
  }

  const originalApi=window.api;
  if(typeof originalApi!=='function')throw new Error('元のデータ取得関数が見つかりません');

  async function authoritativeApi(url,opt){
    if(opt)return originalApi(url,opt);
    if(url==='/api/bootstrap'){
      const b=await originalApi(url);
      return {...b,months:['2026-06','2026-07'],active_month:'2026-07',overview:julyOverview()};
    }
    if(url==='/api/monthly')return monthlyRows();
    if(url==='/api/overview/2026-07')return julyOverview();
    if(url==='/api/overview/all')return allOverview();
    if(url==='/api/products/2026-07')return clone(products);
    if(url==='/api/products/all'){
      const june=await originalApi('/api/products/2026-06');
      const map=new Map();
      [...(Array.isArray(june)?june:[]),...products].forEach(r=>{
        const key=normalize(r.name||r.product_name);
        const prev=map.get(key)||{...r,qty:0,sales:0,issued_count:0,settlement_count:0};
        prev.name=r.name||r.product_name;
        prev.category=r.category||prev.category;
        prev.qty=Number(prev.qty||0)+Number(r.qty||0);
        prev.sales=Number(prev.sales||0)+Number(r.sales||0);
        prev.issued_count=Number(prev.issued_count||0)+Number(r.issued_count||r.qty||0);
        prev.settlement_count=Number(prev.settlement_count||0)+Number(r.settlement_count||0);
        map.set(key,prev);
      });
      const arr=[...map.values()].sort((a,b)=>b.sales-a.sales);
      arr.forEach((r,i)=>{r.rank=i+1;r.share=r.sales/totalSales;});
      return arr;
    }
    if(url==='/api/quality/2026-07'){
      const q=await originalApi(url);
      return {...q,daily:JULY.dailyRegisteredSales,products:JULY.sales,product_match:false,matched:false,
        missing_product_dates:['差額32,690円・60人の発生日は未特定']};
    }
    if(url==='/api/quality/all'){
      const q=await originalApi(url);
      return {...q,daily:JUNE.sales+JULY.dailyRegisteredSales,products:totalSales,product_match:false,matched:false,
        missing_product_dates:['7月差額32,690円・60人の発生日は未特定']};
    }
    return originalApi(url);
  }

  window.api=authoritativeApi;
  try{api=authoritativeApi;}catch(_e){}

  function applyState(){
    if(typeof state==='undefined')return;
    state.monthly=monthlyRows();
    if(state.month==='2026-07'){
      state.overview=julyOverview();
      state.products=clone(products);
    }else if(state.scope==='all')state.overview=allOverview();
  }

  function applyEmbedded(){
    if(typeof EMBEDDED_DATA==='undefined')return;
    EMBEDDED_DATA.bootstrap={...(EMBEDDED_DATA.bootstrap||{}),months:['2026-06','2026-07'],active_month:'2026-07',overview:julyOverview()};
    EMBEDDED_DATA.monthly=monthlyRows();
    EMBEDDED_DATA['overview_2026-07']=julyOverview();
    EMBEDDED_DATA.overview_all=allOverview();
    EMBEDDED_DATA['products_2026-07']=clone(products);
    EMBEDDED_DATA.july_monthly_source={month:JULY.month,sales:JULY.sales,customers:JULY.customers,days:JULY.days,issued:JULY.issued,settlement:JULY.settlement,net:JULY.net};
  }

  window.renderProducts=function(){
    applyState();
    const rows=products.map((r,i)=>[i+1,r.name,yen(r.price),r.issued_count,r.settlement_count,r.qty,yen(r.sales),pct(r.share)]);
    $('host').innerHTML=`<div class="notice ok"><b>7月月間ジャーナル原本40品目。</b> 発行数＋精算数＝正味出数です。</div><div class="panel" style="margin-top:12px"><div class="toolbar"><input id="search" placeholder="商品名を検索" oninput="window.filterJulyProducts()"><span>全40品目</span></div><div id="prod">${table(['順位','商品','単価','発行数','精算数','正味出数','売上','構成比'],rows,true)}</div></div>`;
  };
  window.filterJulyProducts=function(){
    const q=normalize(document.getElementById('search')?.value||'');
    const arr=products.filter(r=>normalize(r.name).includes(q));
    document.getElementById('prod').innerHTML=table(['順位','商品','単価','発行数','精算数','正味出数','売上','構成比'],arr.map((r,i)=>[i+1,r.name,yen(r.price),r.issued_count,r.settlement_count,r.qty,yen(r.sales),pct(r.share)]),true);
  };
  window.renderABC=function(){
    applyState();let cum=0;
    const rows=[...products].sort((a,b)=>b.sales-a.sales).map((r,i)=>{cum+=r.share;return[i+1,cum<=.7?'A':cum<=.9?'B':'C',r.name,r.qty,yen(r.sales),pct(r.share),pct(cum)]});
    $('host').innerHTML=`<div class="notice ok"><b>7月月間原本40品目から自動計算。</b></div><div class="panel" style="margin-top:12px">${table(['順位','ABC','商品','正味出数','売上','構成比','累積構成比'],rows,true)}</div>`;
  };
  window.renderBeer=function(){
    applyState();
    const beer=products.filter(r=>/ビール/.test(r.name)),sets=products.filter(r=>/セット/.test(r.name)),gyoza=products.filter(r=>/餃子/.test(r.name));
    const sy=a=>sum(a,'sales'),sq=a=>sum(a,'qty');
    $('host').innerHTML=`<div class="cards"><div class="card"><div>ビール売上</div><div class="big">${yen(sy(beer))}</div></div><div class="card"><div>ビール正味出数</div><div class="big">${sq(beer)}本</div></div><div class="card"><div>セット売上</div><div class="big">${yen(sy(sets))}</div></div><div class="card"><div>餃子関連売上</div><div class="big">${yen(sy(gyoza))}</div></div></div><div class="grid2" style="margin-top:12px"><div class="panel"><h3>ビール商品</h3>${table(['商品','発行','精算','正味','売上'],beer.map(r=>[r.name,r.issued_count,r.settlement_count,r.qty,yen(r.sales)]))}</div><div class="panel"><h3>セット商品</h3>${table(['商品','正味出数','売上'],sets.map(r=>[r.name,r.qty,yen(r.sales)]))}</div></div>`;
  };

  function auditVisiblePage(){
    const errors=checks();
    if(typeof state!=='undefined'&&state.month==='2026-07'){
      const cardText=document.getElementById('cards')?.textContent||'';
      if(cardText&&!cardText.includes('4,917,050'))errors.push('KPI売上が4,917,050円ではない');
      const bodyText=document.body.textContent||'';
      if(bodyText.includes('4,251,820'))errors.push('旧7月売上4,251,820円が残存');
    }
    const u=document.getElementById('updated');
    if(u)u.textContent=errors.length?`公開禁止：${[...new Set(errors)].join('／')}`:'7月統一検算済：KPI・月別・商品別は4,917,050円／40品目／発行5,048／精算−53／正味4,995';
    return errors;
  }

  const originalShowTab=window.showTab;
  if(typeof originalShowTab==='function'){
    window.showTab=async function(){const v=await originalShowTab.apply(this,arguments);setTimeout(auditVisiblePage,0);return v;};
    try{showTab=window.showTab;}catch(_e){}
  }

  applyEmbedded();
  applyState();
  setTimeout(async()=>{
    try{
      if(typeof reloadCurrent==='function')await reloadCurrent();
      applyState();
      if(typeof state!=='undefined'){
        if(state.tab==='products')window.renderProducts();
        else if(state.tab==='abc')window.renderABC();
        else if(state.tab==='beer')window.renderBeer();
      }
    }finally{auditVisiblePage();}
  },300);
})();