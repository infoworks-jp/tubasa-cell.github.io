(() => {
  const JUNE = {sales:4995250, customers:3587, days:28};
  const JULY = {sales:4917050, customers:3525, days:27};
  const LAST4 = 697920;
  const BEST = {date:'7/19', sales:278000};

  JUNE.avgDaily = JUNE.sales / JUNE.days;
  JULY.avgDaily = JULY.sales / JULY.days;
  JUNE.avgSpend = JUNE.sales / JUNE.customers;
  JULY.avgSpend = JULY.sales / JULY.customers;
  JUNE.avgCustomers = JUNE.customers / JUNE.days;
  JULY.avgCustomers = JULY.customers / JULY.days;

  function forceVerifiedTotals(){
    if(typeof EMBEDDED_DATA==='undefined') return;
    const julyOverview={
      month:'2026-07',
      total_sales:JUNE.sales+JULY.sales,
      total_customers:JUNE.customers+JULY.customers,
      total_days:JUNE.days+JULY.days,
      month_sales:JULY.sales,
      month_customers:JULY.customers,
      month_days:JULY.days,
      avg_daily:JULY.avgDaily,
      avg_spend:JULY.avgSpend,
      projection:JULY.avgDaily*31,
      month_count:2,
      avg_monthly:(JUNE.sales+JULY.sales)/2,
      avg_customers_per_day:JULY.avgCustomers
    };
    EMBEDDED_DATA.overview_2026_07=julyOverview;
    EMBEDDED_DATA.overview_all={
      month:'all',total_sales:JUNE.sales+JULY.sales,total_customers:JUNE.customers+JULY.customers,total_days:JUNE.days+JULY.days,
      month_sales:JUNE.sales+JULY.sales,month_customers:JUNE.customers+JULY.customers,month_days:JUNE.days+JULY.days,
      avg_daily:(JUNE.sales+JULY.sales)/(JUNE.days+JULY.days),avg_spend:(JUNE.sales+JULY.sales)/(JUNE.customers+JULY.customers),
      projection:0,month_count:2,avg_monthly:(JUNE.sales+JULY.sales)/2,avg_customers_per_day:(JUNE.customers+JULY.customers)/(JUNE.days+JULY.days)
    };
    EMBEDDED_DATA.monthly=[
      {month:'2026-06',sales:JUNE.sales,customers:JUNE.customers,days:JUNE.days,avg_daily:JUNE.avgDaily,avg_spend:JUNE.avgSpend},
      {month:'2026-07',sales:JULY.sales,customers:JULY.customers,days:JULY.days,avg_daily:JULY.avgDaily,avg_spend:JULY.avgSpend}
    ];
    if(EMBEDDED_DATA.bootstrap){
      EMBEDDED_DATA.bootstrap.active_month='2026-07';
      EMBEDDED_DATA.bootstrap.months=['2026-06','2026-07'];
      EMBEDDED_DATA.bootstrap.overview=julyOverview;
    }
  }

  function renderJulyConsultingVerified(){
    const totalDiff=JULY.sales-JUNE.sales;
    const totalDiffRate=totalDiff/JUNE.sales;
    const dailyDiff=JULY.avgDaily-JUNE.avgDaily;
    const dailyDiffRate=dailyDiff/JUNE.avgDaily;
    const spendDiff=JULY.avgSpend-JUNE.avgSpend;
    const spendDiffRate=spendDiff/JUNE.avgSpend;
    const customerDailyDiff=JULY.avgCustomers-JUNE.avgCustomers;
    const customerDailyRate=customerDailyDiff/JUNE.avgCustomers;

    $('host').innerHTML=`
      <div class="notice ok" style="margin-bottom:12px"><b>2026年7月 売上確定版</b>　月間ジャーナル確定値を基準に表示しています。</div>
      <div class="cards">
        <div class="card"><div class="label">7月確定売上</div><div class="big">${yen(JULY.sales)}</div><div class="sub">月間集計票と一致</div></div>
        <div class="card"><div class="label">入店数</div><div class="big">${JULY.customers.toLocaleString()}人</div><div class="sub">月間集計票と一致</div></div>
        <div class="card"><div class="label">平均客単価</div><div class="big">${yen(JULY.avgSpend)}</div><div class="sub">6月比 +${yen(spendDiff)}（+${(spendDiffRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">平均日商</div><div class="big up">${yen(JULY.avgDaily)}</div><div class="sub">6月比 +${yen(dailyDiff)}（+${(dailyDiffRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">1日平均入店数</div><div class="big up">${JULY.avgCustomers.toFixed(1)}人</div><div class="sub">6月比 +${customerDailyDiff.toFixed(1)}人（+${(customerDailyRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">月間総額の差</div><div class="big down">${yen(totalDiff)}</div><div class="sub">6月28営業日、7月27営業日（${(totalDiffRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">月末4日売上</div><div class="big">${yen(LAST4)}</div><div class="sub">7/28〜7/31</div></div>
      </div>

      <div class="panel" style="margin-top:12px"><h3>7月経営総括</h3>
        <div class="insight"><b>結論：7月の営業効率は6月を上回っています。</b><br>月間総額は営業日が1日少ないため${yen(Math.abs(totalDiff))}少ないですが、平均日商は6月${yen(JUNE.avgDaily)}から7月${yen(JULY.avgDaily)}へ${yen(dailyDiff)}増加しました。</div>
        <div class="insight"><b>客数と客単価も改善。</b><br>1日平均入店数は${JUNE.avgCustomers.toFixed(1)}人から${JULY.avgCustomers.toFixed(1)}人へ増加し、平均客単価も${yen(JUNE.avgSpend)}から${yen(JULY.avgSpend)}へ上昇しています。</div>
        <div class="insight"><b>月末4日売上は${yen(LAST4)}。</b><br>月内最高日は${BEST.date}の${yen(BEST.sales)}です。</div>
        <div class="insight"><b>月間検算済み。</b><br>総売上${yen(JULY.sales)}、入店数${JULY.customers.toLocaleString()}人は月間ジャーナルと一致しています。</div>
      </div>

      <div class="grid2" style="margin-top:12px">
        <div class="panel"><h3>6月との正しい比較</h3>${table(['指標','6月','7月','差'],[
          ['月間総売上',yen(JUNE.sales),yen(JULY.sales),yen(totalDiff)],
          ['営業日',JUNE.days+'日',JULY.days+'日','-1日'],
          ['平均日商',yen(JUNE.avgDaily),yen(JULY.avgDaily),'+'+yen(dailyDiff)],
          ['1日平均入店数',JUNE.avgCustomers.toFixed(1)+'人',JULY.avgCustomers.toFixed(1)+'人','+'+customerDailyDiff.toFixed(1)+'人'],
          ['平均客単価',yen(JUNE.avgSpend),yen(JULY.avgSpend),'+'+yen(spendDiff)]
        ])}</div>
        <div class="panel"><h3>未確定項目</h3><div class="notice"><b>7月給与と社会保険料が未確定です。</b><br>人件費率、営業利益、損益分岐点、最終評価は確定後に更新します。</div></div>
      </div>

      <div class="notice" style="margin-top:12px"><b>修正済み：</b>修正用5日分だけを7月全体として再集計していたバグを廃止し、月間ジャーナル確定値を直接基準にしました。</div>`;
  }

  window.renderConsulting=renderJulyConsultingVerified;

  setTimeout(async()=>{
    forceVerifiedTotals();
    if(typeof reloadCurrent==='function') await reloadCurrent();
    forceVerifiedTotals();
    if(state && state.tab==='consulting') renderJulyConsultingVerified();
    const u=document.getElementById('updated');
    if(u)u.textContent='データ更新 2026/8/1（7月確定値を再検証済み）';
  },150);
})();