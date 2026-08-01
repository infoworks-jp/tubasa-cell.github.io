(() => {
  'use strict';

  const MONTHS = Object.freeze({
    '2026-06': {
      status: 'provisional',
      label: '暫定・月間集計票なし',
      sales: 4995250,
      customers: 3587,
      days: 28,
      source: '日別積上げ・既存登録値',
      note: '月間ジャーナル原本がないため、日別原本・商品別・通帳による再監査が必要です。'
    },
    '2026-07': {
      status: 'confirmed-monthly',
      label: '月間原本確定・日別差異あり',
      sales: 4917050,
      customers: 3525,
      days: 27,
      issued: 5048,
      settlement: -53,
      net: 4995,
      source: '券売機7月月間ジャーナル原本',
      note: '月間総額は確定。日別積上げとの差32,690円・60人は未解決です。'
    }
  });

  const FRIED_RICE = Object.freeze({name:'チャーハン', qty:135, sales:108000});

  function yenAdmin(v){
    const n = Math.round(Number(v) || 0);
    return (n < 0 ? '−' : '') + '¥' + Math.abs(n).toLocaleString('ja-JP');
  }

  function normalizeName(value){
    return String(value ?? '')
      .normalize('NFKC')
      .replace(/[\s　]+/g, '')
      .replace(/[()（）]/g, '')
      .trim();
  }

  function rowName(row){
    return String(row?.name ?? row?.product_name ?? row?.item_name ?? '').trim();
  }

  function rowQty(row){
    return Number(row?.qty ?? row?.quantity ?? row?.count ?? 0);
  }

  function rowSales(row){
    return Number(row?.sales ?? row?.amount ?? 0);
  }

  function canonicalProducts(source){
    if(!Array.isArray(source)) return [];
    const groups = new Map();
    for(const original of source){
      const key = normalizeName(rowName(original));
      if(!key) continue;
      const row = {...original};
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }

    const result = [];
    for(const [key, rows] of groups.entries()){
      let selected = rows.slice().sort((a,b)=>{
        const sd = rowSales(b) - rowSales(a);
        if(sd) return sd;
        return rowQty(b) - rowQty(a);
      })[0];

      if(key === normalizeName(FRIED_RICE.name)){
        selected = {...selected, name:FRIED_RICE.name, qty:FRIED_RICE.qty, sales:FRIED_RICE.sales};
        if('product_name' in selected) selected.product_name = FRIED_RICE.name;
        if('item_name' in selected) selected.item_name = FRIED_RICE.name;
        if('quantity' in selected) selected.quantity = FRIED_RICE.qty;
        if('count' in selected) selected.count = FRIED_RICE.qty;
        if('amount' in selected) selected.amount = FRIED_RICE.sales;
      }
      result.push(selected);
    }

    result.sort((a,b)=>rowSales(b)-rowSales(a) || rowName(a).localeCompare(rowName(b),'ja'));
    const total = result.reduce((sum,row)=>sum+rowSales(row),0);
    for(const row of result){
      row.share = total ? rowSales(row)/total : 0;
      row.qty = rowQty(row);
      row.sales = rowSales(row);
      row.name = rowName(row);
    }
    return result;
  }

  function installCanonicalProducts(){
    if(typeof state !== 'undefined' && state && Array.isArray(state.products)){
      state.products = canonicalProducts(state.products);
    }
    if(typeof EMBEDDED_DATA !== 'undefined'){
      for(const key of Object.keys(EMBEDDED_DATA)){
        if(/product/i.test(key) && Array.isArray(EMBEDDED_DATA[key])){
          EMBEDDED_DATA[key] = canonicalProducts(EMBEDDED_DATA[key]);
        }
      }
    }
  }

  function auditNotice(){
    return `<div class="notice" style="background:#fff7ed;border:1px solid #fdba74;margin-bottom:12px">
      <b>管理者監査状態</b><br>
      6月：暫定値（月間集計票なし）／7月：月間原本確定、日別差異32,690円・60人は未解決。<br>
      未解決項目を一致済みとして表示しません。 <a href="./admin-audit.html">監査状況を開く</a>
    </div>`;
  }

  function prependAuditNotice(){
    const host = document.getElementById('host');
    if(!host || document.getElementById('adminAuditNotice')) return;
    const wrap = document.createElement('div');
    wrap.id = 'adminAuditNotice';
    wrap.innerHTML = auditNotice();
    host.prepend(wrap);
  }

  function addAuditNav(){
    const nav = document.querySelector('header nav, nav');
    if(!nav || document.getElementById('adminAuditLink')) return;
    const button = document.createElement('button');
    button.id = 'adminAuditLink';
    button.textContent = '監査状況 ↗';
    button.onclick = () => { location.href = './admin-audit.html'; };
    nav.appendChild(button);
  }

  function adminProductRows(query=''){
    installCanonicalProducts();
    const q = String(query).toLowerCase();
    return (state.products || []).filter(row=>{
      const hay = `${row.name||''} ${row.category||''} ${row.detail||''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  window.renderProducts = function(){
    installCanonicalProducts();
    state.products.forEach(x=>x.detail = typeof detailCategory==='function' ? detailCategory(x.name,x.category) : (x.detail||''));
    $('host').innerHTML = `<div class="panel"><div class="toolbar"><input id="search" placeholder="商品名・分類を検索" oninput="filterProducts()"><span>全商品 ${state.products.length}品目（重複除外後）</span></div><div id="prod"></div></div>`;
    window.filterProducts();
    prependAuditNotice();
  };

  window.filterProducts = function(){
    const rows = adminProductRows(document.getElementById('search')?.value || '');
    const target = document.getElementById('prod');
    if(!target) return;
    target.innerHTML = table(
      ['順位','商品','券売機分類','詳細分類','出数','売上','構成比'],
      rows.map((r,i)=>[i+1,r.name,r.category||'',r.detail||'',r.qty,yenAdmin(r.sales),pct(r.share)]),
      true
    );
  };

  window.renderABC = function(){
    installCanonicalProducts();
    let cumulative = 0;
    const rows = state.products.map((r,i)=>{
      cumulative += Number(r.share||0);
      const rank = cumulative <= .7 ? 'A' : cumulative <= .9 ? 'B' : 'C';
      return [i+1,rank,r.name,typeof detailCategory==='function'?detailCategory(r.name,r.category):'',r.qty,yenAdmin(r.sales),pct(r.share),pct(cumulative)];
    });
    $('host').innerHTML = `<div class="notice">A：累積70%まで／B：90%まで／C：残り。重複商品名は表示前に除外しています。</div><div class="panel" style="margin-top:10px">${table(['順位','ABC','商品','詳細分類','出数','売上','構成比','累積構成比'],rows,true)}</div>`;
    prependAuditNotice();
  };

  window.renderBeer = function(){
    installCanonicalProducts();
    const products = state.products || [];
    const beer = products.filter(r=>/ビール/.test(r.name));
    const sets = products.filter(r=>/セット/.test(r.name));
    const gyoza = products.filter(r=>/餃子/.test(r.name));
    const sum = arr=>arr.reduce((s,x)=>s+Number(x.sales||0),0);
    const qty = arr=>arr.reduce((s,x)=>s+Number(x.qty||0),0);
    const total = sum(products);
    $('host').innerHTML = `<div class="cards"><div class="card"><div>ビール売上</div><div class="big">${yenAdmin(sum(beer))}</div><div class="sub">構成比 ${pct(total?sum(beer)/total:0)}</div></div><div class="card"><div>ビール出数</div><div class="big">${qty(beer)}本</div></div><div class="card"><div>セット売上</div><div class="big">${yenAdmin(sum(sets))}</div></div><div class="card"><div>餃子関連売上</div><div class="big">${yenAdmin(sum(gyoza))}</div></div></div><div class="grid2" style="margin-top:12px"><div class="panel"><h3>ビール商品</h3>${table(['商品','出数','売上','構成比'],beer.map(r=>[r.name,r.qty,yenAdmin(r.sales),pct(r.share)]))}</div><div class="panel"><h3>セット商品</h3>${table(['商品','出数','売上','構成比'],sets.map(r=>[r.name,r.qty,yenAdmin(r.sales),pct(r.share)]))}</div></div>`;
    prependAuditNotice();
  };

  window.renderMonthly = function(){
    const rows = Object.entries(MONTHS).map(([month,m])=>{
      const avgDaily = m.sales/m.days;
      const avgSpend = m.sales/m.customers;
      return [
        month.replace('-','年')+'月',
        yenAdmin(m.sales),
        `${m.days}日`,
        yenAdmin(avgDaily),
        `${m.customers.toLocaleString()}人`,
        yenAdmin(avgSpend),
        m.label,
        m.source
      ];
    });
    $('host').innerHTML = `<div class="panel"><h3>月別売上・監査状態</h3>${table(['月','売上','営業日','平均日商','入店数','客単価','確定度','基準資料'],rows,true)}</div><div class="notice" style="margin-top:12px"><b>注意：</b>6月と7月は証拠資料の強さが違います。6月は暫定、7月は月間原本の総額確定です。</div>`;
    prependAuditNotice();
  };

  window.renderConsulting = function(){
    const june = MONTHS['2026-06'];
    const july = MONTHS['2026-07'];
    const juneDaily = june.sales/june.days;
    const julyDaily = july.sales/july.days;
    const juneSpend = june.sales/june.customers;
    const julySpend = july.sales/july.customers;
    const totalDiff = july.sales-june.sales;
    const dailyDiff = julyDaily-juneDaily;
    const spendDiff = julySpend-juneSpend;
    const juneCust = june.customers/june.days;
    const julyCust = july.customers/july.days;

    $('host').innerHTML = `
      <div class="notice ok"><b>7月経営コンサル（売上確定・利益未確定）</b><br>7月月間ジャーナルの確定値を基準にしています。6月は月間原本がないため比較は暫定です。</div>
      <div class="cards" style="margin-top:12px">
        <div class="card"><div class="label">7月総売上</div><div class="big">${yenAdmin(july.sales)}</div><div class="sub">月間原本確定</div></div>
        <div class="card"><div class="label">7月入店数</div><div class="big">${july.customers.toLocaleString()}人</div></div>
        <div class="card"><div class="label">7月平均日商</div><div class="big">${yenAdmin(julyDaily)}</div><div class="sub">6月暫定比 ${yenAdmin(dailyDiff)}</div></div>
        <div class="card"><div class="label">7月客単価</div><div class="big">${yenAdmin(julySpend)}</div><div class="sub">6月暫定比 ${yenAdmin(spendDiff)}</div></div>
        <div class="card"><div class="label">月間総額差</div><div class="big">${yenAdmin(totalDiff)}</div><div class="sub">6月28日／7月27日</div></div>
        <div class="card"><div class="label">正味出数</div><div class="big">${july.net.toLocaleString()}</div><div class="sub">発行5,048・精算−53</div></div>
      </div>
      <div class="panel" style="margin-top:12px"><h3>管理者判断</h3>
        <div class="insight"><b>7月は営業日当たりの売上が6月暫定値より高い。</b><br>ただし6月は月間原本がないため、最終確定比較ではありません。</div>
        <div class="insight"><b>7月月間総額は確定、日別内訳は未確定。</b><br>日別積上げとの差32,690円・60人が残るため、日別・曜日別・時間帯別の結論は保留します。</div>
        <div class="insight"><b>利益評価は未実施。</b><br>7月給与・社会保険料・仕入・固定費が揃うまで、人件費率・営業利益・損益分岐点は確定しません。</div>
      </div>
      <div class="panel" style="margin-top:12px"><h3>6月・7月比較</h3>${table(['指標','6月','7月','判断'],[
        ['総売上',yenAdmin(june.sales)+'（暫定）',yenAdmin(july.sales)+'（確定）','単純差 '+yenAdmin(totalDiff)],
        ['営業日',june.days+'日',july.days+'日','7月が1日少ない'],
        ['平均日商',yenAdmin(juneDaily),yenAdmin(julyDaily),'7月 '+yenAdmin(dailyDiff)],
        ['1日平均入店数',juneCust.toFixed(1)+'人',julyCust.toFixed(1)+'人','7月 '+(julyCust-juneCust).toFixed(1)+'人'],
        ['客単価',yenAdmin(juneSpend),yenAdmin(julySpend),'7月 '+yenAdmin(spendDiff)]
      ],true)}</div>`;
    prependAuditNotice();
  };

  function validateAdminState(){
    installCanonicalProducts();
    const errors = [];
    const products = (typeof state!=='undefined' && state?.products) ? state.products : [];
    const names = products.map(r=>normalizeName(r.name)).filter(Boolean);
    const duplicates = [...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
    if(duplicates.length) errors.push('商品重複:'+duplicates.join('、'));
    const fried = products.filter(r=>normalizeName(r.name)===normalizeName(FRIED_RICE.name));
    if(fried.length !== 1) errors.push('チャーハン行数:'+fried.length);
    if(fried.length === 1 && (Number(fried[0].qty)!==135 || Number(fried[0].sales)!==108000)) errors.push('チャーハン数値不一致');
    return errors;
  }

  addAuditNav();
  installCanonicalProducts();

  setTimeout(async()=>{
    if(typeof reloadCurrent === 'function') await reloadCurrent();
    installCanonicalProducts();
    addAuditNav();
    const errors = validateAdminState();
    const updated = document.getElementById('updated');
    if(updated){
      updated.textContent = errors.length
        ? `公開禁止：管理者検査エラー（${errors.join('／')}）`
        : 'データ更新 2026/8/2（管理者監査レイヤー適用）';
    }
    if(typeof state!=='undefined'){
      if(state.tab==='products') window.renderProducts();
      else if(state.tab==='abc') window.renderABC();
      else if(state.tab==='beer') window.renderBeer();
      else if(state.tab==='monthly') window.renderMonthly();
      else if(state.tab==='consulting') window.renderConsulting();
      else prependAuditNotice();
    }
  },900);
})();