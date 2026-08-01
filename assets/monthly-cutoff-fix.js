(() => {
  const JULY_JOURNAL = Object.freeze({
    month: '2026-07',
    issued_count: 5048,
    settlement_count: -53,
    net_count: 4995,
    total_sales: 4917050,
    customers: 3525,
    avg_spend: 4917050 / 3525
  });

  function installVerifiedJournal(){
    if(typeof EMBEDDED_DATA !== 'undefined'){
      EMBEDDED_DATA.monthly_journal_2026_07 = {...JULY_JOURNAL};
    }
  }

  function journalPanel(){
    return `<div class="panel" id="verifiedJulyJournal" style="margin-top:12px">
      <h3>2026年7月 月間ジャーナル確定値</h3>
      ${table(['項目','原本確定値','検算'],[
        ['発行数','5,048','原本 G小計・総計'],
        ['精算数','−53','原本 G小計・総計'],
        ['正味出数','4,995','5,048 − 53'],
        ['総売上',yen(4917050),'原本 G小計・総計'],
        ['入店数','3,525人','原本下段'],
        ['客単価',yen(4917050/3525),'総売上 ÷ 入店数']
      ])}
      <div class="notice ok" style="margin-top:10px"><b>用語を分離：</b>発行数5,048、精算数−53、正味出数4,995は別の数値です。今後「累計締切数」と一括表示しません。</div>
    </div>`;
  }

  const originalRenderMonthly = window.renderMonthly;
  if(typeof originalRenderMonthly === 'function'){
    window.renderMonthly = function(){
      installVerifiedJournal();
      originalRenderMonthly.apply(this,arguments);
      const host=document.getElementById('host');
      if(host && !document.getElementById('verifiedJulyJournal')) host.insertAdjacentHTML('beforeend',journalPanel());
    };
  }

  const originalRenderConsulting = window.renderConsulting;
  if(typeof originalRenderConsulting === 'function'){
    window.renderConsulting = function(){
      installVerifiedJournal();
      originalRenderConsulting.apply(this,arguments);
      const host=document.getElementById('host');
      if(host && !document.getElementById('verifiedJulyJournal')) host.insertAdjacentHTML('beforeend',journalPanel());
    };
  }

  installVerifiedJournal();
  setTimeout(()=>{
    installVerifiedJournal();
    if(typeof state!=='undefined' && state.tab==='monthly' && typeof window.renderMonthly==='function') window.renderMonthly();
    if(typeof state!=='undefined' && state.tab==='consulting' && typeof window.renderConsulting==='function') window.renderConsulting();
    const u=document.getElementById('updated');
    if(u) u.textContent='データ更新 2026/8/2（7月月間ジャーナル：発行5,048・精算−53・正味4,995）';
  },650);
})();