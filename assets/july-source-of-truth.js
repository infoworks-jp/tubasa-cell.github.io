(() => {
  'use strict';

  const JUNE={month:'2026-06',sales:4995250,customers:3587,days:28};
  const JULY={month:'2026-07',sales:4917050,customers:3525,days:27,issued:5048,settlement:-53,net:4995,dailySales:4949740,dailyCustomers:3585};
  const RAW=[
    ['究極の味噌ラーメン',1100,1891,-20,2058100],['バターコーンラーメン味噌',1400,456,-1,637000],['チャーシュー麺味噌',1450,120,0,174000],['ネギたっぷりラーメン味噌',1300,88,0,114400],['ピリ辛ネギラーメン味噌',1300,108,0,140400],['キムチラーメン味噌',1250,17,0,21250],['ラーメン醤油',980,138,-2,133280],['バターコーンラーメン醤油',1300,23,0,29900],['チャーシュー麺醤油',1350,25,0,33750],['ネギたっぷりラーメン醤油',1180,14,0,16520],['ピリ辛ネギラーメン醤油',1180,21,-1,23600],['キムチラーメン醤油',1130,1,0,1130],['ラーメン塩',980,136,-1,132300],['バターコーンラーメン塩',1300,27,0,35100],['チャーシュー麺塩',1350,10,-1,12150],['ネギたっぷりラーメン塩',1180,24,0,28320],['ピリ辛ネギラーメン塩',1180,13,0,15340],['キムチラーメン塩',1130,2,0,2260],['味噌＋餃子セット',1450,123,0,178350],['醤油＋餃子セット',1400,10,0,14000],['塩＋餃子セット',1400,6,0,8400],['大盛り',200,120,-2,23600],['トッピングチャーシュー',450,22,0,9900],['辛みそラーメン（期間限定）',1200,54,-1,63600],['お子様ハーフ味噌',700,147,0,102900],['お子様ハーフ醤油',650,26,0,16900],['お子様ハーフ塩',650,21,0,13650],['キムチわかめたまご',150,23,0,3450],['バター・コーン',200,78,-1,15400],['ねぎ・ピリ辛ねぎ',200,33,0,6600],['ライス大',200,48,-2,9200],['ライス小',150,89,-1,13200],['チャーハン',800,135,0,108000],['餃子（1皿6個）',500,233,-17,108000],['お土産ラーメン',700,24,0,16800],['生ビール',600,291,0,174600],['瓶ビール',700,281,-3,194600],['冷酒',700,11,0,7700],['ジュース コーラ',300,58,0,17400],['つばさラーメン',2000,101,0,202000]
  ];

  const clone=v=>JSON.parse(JSON.stringify(v));
  const norm=s=>String(s||'').normalize('NFKC').replace(/[\s　]+/g,'').trim();
  const category=n=>/ビール|冷酒|ジュース/.test(n)?'飲料':/セット/.test(n)?'セット':/餃子|チャーハン|ライス|大盛り|トッピング|バター・コーン|ねぎ|キムチわかめ|お土産/.test(n)?'サイド・トッピング':'ラーメン';
  const products=RAW.map((r,i)=>({rank:i+1,name:r[0],price:r[1],issued_count:r[2],settlement_count:r[3],qty:r[2]+r[3],sales:r[4],category:category(r[0]),share:r[4]/JULY.sales}));
  const total=(a,k)=>a.reduce((s,x)=>s+Number(x[k]||0),0);
  const totalSales=JUNE.sales+JULY.sales,totalCustomers=JUNE.customers+JULY.customers,totalDays=JUNE.days+JULY.days;
  const monthly=()=>[
    {month:JUNE.month,sales:JUNE.sales,customers:JUNE.customers,days:JUNE.days,avg_daily:JUNE.sales/JUNE.days,avg_spend:JUNE.sales/JUNE.customers},
    {month:JULY.month,sales:JULY.sales,customers:JULY.customers,days:JULY.days,avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers}
  ];
  const overview=()=>({month:JULY.month,total_sales:totalSales,total_customers:totalCustomers,total_days:totalDays,month_sales:JULY.sales,month_customers:JULY.customers,month_days:JULY.days,avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers,projection:JULY.sales,month_count:2,avg_monthly:totalSales/2,avg_customers_per_day:JULY.customers/JULY.days});

  function baseChecks(){
    const e=[];
    if(products.length!==40)e.push('商品数');
    if(new Set(products.map(x=>norm(x.name))).size!==40)e.push('商品重複');
    if(total(products,'issued_count')!==5048)e.push('発行数');
    if(total(products,'settlement_count')!==-53)e.push('精算数');
    if(total(products,'qty')!==4995)e.push('正味出数');
    if(total(products,'sales')!==4917050)e.push('商品売上');
    const c=products.filter(x=>x.name==='チャーハン');
    if(c.length!==1||c[0].qty!==135||c[0].sales!==108000)e.push('チャーハン');
    return e;
  }

  const oldApi=window.api;
  async function fixedApi(url,opt){
    if(opt)return oldApi(url,opt);
    if(url==='/api/bootstrap'){const b=await oldApi(url);return {...b,months:['2026-06','2026-07'],active_month:'2026-07',overview:overview()};}
    if(url==='/api/monthly')return monthly();
    if(url==='/api/overview/2026-07')return overview();
    if(url==='/api/overview/all')return {month:'all',total_sales:totalSales,total_customers:totalCustomers,total_days:totalDays,month_sales:totalSales,month_customers:totalCustomers,month_days:totalDays,avg_daily:totalSales/totalDays,avg_spend:totalSales/totalCustomers,projection:0,month_count:2,avg_monthly:totalSales/2,avg_customers_per_day:totalCustomers/totalDays};
    if(url==='/api/products/2026-07')return clone(products);
    if(url==='/api/quality/2026-07'){return {daily:JULY.dailySales,products:JULY.sales,hourly:0,settlement_adjustment:0,hourly_net:0,product_match:false,hourly_match:false,matched:false,holidays:4,pending:0,missing_product_dates:['差額32,690円・60人の発生日は未特定'],details:[]};}
    return oldApi(url);
  }
  window.api=fixedApi;try{api=fixedApi}catch(_e){}

  function sync(){
    if(typeof EMBEDDED_DATA!=='undefined'){
      EMBEDDED_DATA.bootstrap={...(EMBEDDED_DATA.bootstrap||{}),months:['2026-06','2026-07'],active_month:'2026-07',overview:overview()};
      EMBEDDED_DATA.monthly=monthly();EMBEDDED_DATA['overview_2026-07']=overview();EMBEDDED_DATA['products_2026-07']=clone(products);
    }
    if(typeof state!=='undefined'){
      state.monthly=monthly();
      if(state.month==='2026-07'){state.overview=overview();state.products=clone(products);}
    }
  }

  window.renderOverview=function(){
    sync();const d=overview(),diff=JULY.sales-JUNE.sales,dailyDiff=JULY.sales/JULY.days-JUNE.sales/JUNE.days;
    $('host').innerHTML=`<div class="notice ok"><b>7月月間ジャーナル確定値を基準に表示。</b></div><div class="cards" style="margin-top:12px"><div class="card"><div class="label">7月売上</div><div class="big">${yen(JULY.sales)}</div></div><div class="card"><div class="label">入店数</div><div class="big">${JULY.customers.toLocaleString()}人</div></div><div class="card"><div class="label">平均日商</div><div class="big">${yen(d.avg_daily)}</div></div><div class="card"><div class="label">客単価</div><div class="big">${yen(d.avg_spend)}</div></div><div class="card"><div class="label">月間差額</div><div class="big down">${yen(diff)}</div><div class="sub">6月比</div></div><div class="card"><div class="label">平均日商差</div><div class="big up">+${yen(dailyDiff)}</div><div class="sub">6月比</div></div></div><div class="panel" style="margin-top:12px"><h3>データ状態</h3>${table(['項目','値','状態'],[['月間売上',yen(JULY.sales),'確定'],['商品別合計',yen(total(products,'sales')),'一致'],['日別登録合計',yen(JULY.dailySales),'月間票より+32,690円'],['入店数差',JULY.dailyCustomers+'人','月間票より+60人']])}</div>`;
  };

  window.renderMonthly=function(){
    sync();const rows=monthly();const grand=totalSales;
    $('host').innerHTML=`<div class="notice ok"><b>月別表と上部KPIは同じ月別データを参照。</b></div><div class="panel" style="margin-top:12px">${table(['月','売上','構成比','営業日','平均日商','入店数','客単価','状態'],rows.map(r=>[ymLabel(r.month),yen(r.sales),pct(r.sales/grand),r.days+'日',yen(r.avg_daily),r.customers+'人',yen(r.avg_spend),r.month==='2026-07'?'月間票確定':'月間票なし・日別積上げ']))}</div>`;
  };

  window.renderProducts=function(){
    sync();$('host').innerHTML=`<div class="notice ok"><b>7月原本の全40品目を表示。</b></div><div class="panel" style="margin-top:12px"><div class="toolbar"><input id="search" placeholder="商品名を検索" oninput="filterJulyProducts()"><span>40品目</span></div><div id="prod"></div></div>`;window.filterJulyProducts();
  };
  window.filterJulyProducts=function(){const q=norm(document.getElementById('search')?.value||'');const a=products.filter(x=>norm(x.name).includes(q));$('prod').innerHTML=table(['順位','商品','分類','単価','発行','精算','正味','売上','構成比'],a.map((r,i)=>[i+1,r.name,r.category,yen(r.price),r.issued_count,r.settlement_count,r.qty,yen(r.sales),pct(r.share)]),true)};

  window.renderABC=function(){
    sync();let cum=0;const sorted=[...products].sort((a,b)=>b.sales-a.sales);const rows=sorted.map((r,i)=>{cum+=r.share;return[i+1,cum<=.7?'A':cum<=.9?'B':'C',r.name,r.category,r.qty,yen(r.sales),pct(r.share),pct(cum)]});
    const counts={A:rows.filter(x=>x[1]==='A').length,B:rows.filter(x=>x[1]==='B').length,C:rows.filter(x=>x[1]==='C').length};
    $('host').innerHTML=`<div class="cards"><div class="card"><div>A商品</div><div class="big">${counts.A}品</div></div><div class="card"><div>B商品</div><div class="big">${counts.B}品</div></div><div class="card"><div>C商品</div><div class="big">${counts.C}品</div></div><div class="card"><div>対象商品</div><div class="big">40品</div></div></div><div class="notice ok" style="margin-top:12px"><b>全40品目を売上順に再計算。</b> A＝累積70%まで、B＝90%まで、C＝残り。</div><div class="panel" style="margin-top:12px">${table(['順位','ABC','商品','分類','正味出数','売上','構成比','累積構成比'],rows,true)}</div>`;
  };

  window.renderWeekday=function(){
    const rows0=(state.daily||[]).filter(r=>Number(r.total_sales||0)>0);const map={};rows0.forEach(r=>{const w=weekdayName(r.business_date);const x=map[w]||(map[w]={days:0,sales:0,customers:0});x.days++;x.sales+=Number(r.total_sales||0);x.customers+=Number(r.customers||0)});const order=['月','火','水','木','金','土','日'];const rows=order.map(w=>{const x=map[w]||{days:0,sales:0,customers:0};return{w,...x,avg:x.days?x.sales/x.days:0,spend:x.customers?x.sales/x.customers:0}});const s=rows.reduce((a,x)=>a+x.sales,0);
    $('host').innerHTML=`<div class="notice ng"><b>曜日別は日別登録データから計算。</b> 現在の日別合計は${yen(s)}で、月間票${yen(JULY.sales)}より${yen(s-JULY.sales)}多いため、曜日別も再監査中です。月間確定値とは混ぜません。</div><div class="panel" style="margin-top:12px">${table(['曜日','営業日','日別登録売上','構成比','平均日商','入店数','客単価'],rows.map(x=>[x.w,x.days+'日',yen(x.sales),pct(s?x.sales/s:0),yen(x.avg),x.customers+'人',yen(x.spend)]))}</div>`;
  };

  window.renderBeer=function(){sync();const beer=products.filter(x=>/ビール/.test(x.name)),sets=products.filter(x=>/セット/.test(x.name)),gyoza=products.filter(x=>/餃子/.test(x.name));const sy=a=>total(a,'sales'),sq=a=>total(a,'qty');$('host').innerHTML=`<div class="cards"><div class="card"><div>ビール売上</div><div class="big">${yen(sy(beer))}</div></div><div class="card"><div>ビール正味出数</div><div class="big">${sq(beer)}本</div></div><div class="card"><div>セット売上</div><div class="big">${yen(sy(sets))}</div></div><div class="card"><div>餃子関連売上</div><div class="big">${yen(sy(gyoza))}</div></div></div><div class="grid2" style="margin-top:12px"><div class="panel"><h3>ビール</h3>${table(['商品','発行','精算','正味','売上'],beer.map(r=>[r.name,r.issued_count,r.settlement_count,r.qty,yen(r.sales)]))}</div><div class="panel"><h3>セット</h3>${table(['商品','正味','売上'],sets.map(r=>[r.name,r.qty,yen(r.sales)]))}</div></div>`};

  window.renderQuality=function(){const e=baseChecks();$('host').innerHTML=`<div class="notice ${e.length?'ng':'ok'}"><b>${e.length?'商品原本検算NG':'商品原本検算一致'}</b>${e.length?'：'+e.join('、'):''}</div><div class="cards" style="margin-top:12px"><div class="card"><div>月間売上</div><div class="big">${yen(JULY.sales)}</div></div><div class="card"><div>商品別合計</div><div class="big">${yen(total(products,'sales'))}</div></div><div class="card"><div>日別登録合計</div><div class="big down">${yen(JULY.dailySales)}</div></div><div class="card"><div>日別差額</div><div class="big down">+${yen(JULY.dailySales-JULY.sales)}</div></div><div class="card"><div>月間入店数</div><div class="big">${JULY.customers.toLocaleString()}人</div></div><div class="card"><div>日別入店数</div><div class="big down">${JULY.dailyCustomers.toLocaleString()}人</div></div></div><div class="panel" style="margin-top:12px">${table(['検証','基準','結果','判定'],[['商品数','40',products.length,products.length===40?'一致':'NG'],['発行数','5,048',total(products,'issued_count'),total(products,'issued_count')===5048?'一致':'NG'],['精算数','−53',total(products,'settlement_count'),total(products,'settlement_count')===-53?'一致':'NG'],['正味出数','4,995',total(products,'qty'),total(products,'qty')===4995?'一致':'NG'],['商品売上','¥4,917,050',yen(total(products,'sales')),total(products,'sales')===4917050?'一致':'NG'],['日別売上','¥4,917,050',yen(JULY.dailySales),'+¥32,690 未解決'],['日別入店数','3,525人',JULY.dailyCustomers+'人','+60人 未解決']])}</div>`};

  sync();
  setTimeout(async()=>{sync();if(typeof reloadCurrent==='function')await reloadCurrent();sync();if(typeof state!=='undefined')await showTab(state.tab);const u=$('updated');if(u)u.textContent=baseChecks().length?'公開禁止：商品原本検算NG':'7月統一検算：月別・概要・商品・ABC・曜日・品質を同一基準へ更新';},400);
})();