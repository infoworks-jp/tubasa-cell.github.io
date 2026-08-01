(() => {
  const JUNE={sales:4995250,customers:3587,days:28};
  const JULY={sales:4917050,customers:3525,days:27};
  const JULY_DAILY_SUM=4949740;
  const JULY_DAILY_CUSTOMERS=3585;
  const LAST4=697920;

  const yen0=n=>'¥'+Math.round(Math.abs(Number(n)||0)).toLocaleString('ja-JP');
  const signedYen=n=>(n<0?'−':n>0?'+':'')+yen0(n);
  const pct1=n=>(n<0?'−':n>0?'+':'')+Math.abs(n*100).toFixed(1)+'%';

  function applyVerifiedData(){
    if(typeof EMBEDDED_DATA==='undefined')return;

    const byDate=new Map((EMBEDDED_DATA.daily_2026_07||[]).map(r=>[r.business_date,r]));
    const original=byDate.get('2026-07-22')||{};
    byDate.set('2026-07-22',{
      ...original,
      business_date:'2026-07-22',
      total_sales:196500,
      customers:162,
      avg_spend:1213,
      issued_count:null,
      settlement_count:null,
      settlement_amount:null,
      net_count:null,
      notes:'原本確認済み：売上196,500円・入店数162人。商品別・時間帯別・精算内訳は未確認のため推測しない。'
    });
    EMBEDDED_DATA.daily_2026_07=[...byDate.values()].sort((a,b)=>a.business_date.localeCompare(b.business_date));
    EMBEDDED_DATA.daily_all=[...(EMBEDDED_DATA.daily_2026_06||[]),...EMBEDDED_DATA.daily_2026_07].sort((a,b)=>a.business_date.localeCompare(b.business_date));

    const julyOverview={month:'2026-07',total_sales:JUNE.sales+JULY.sales,total_customers:JUNE.customers+JULY.customers,total_days:JUNE.days+JULY.days,month_sales:JULY.sales,month_customers:JULY.customers,month_days:JULY.days,avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers,projection:JULY.sales/JULY.days*31,month_count:2,avg_monthly:(JUNE.sales+JULY.sales)/2,avg_customers_per_day:JULY.customers/JULY.days};
    EMBEDDED_DATA.overview_2026_07=julyOverview;
    EMBEDDED_DATA.monthly=[
      {month:'2026-06',sales:JUNE.sales,customers:JUNE.customers,days:JUNE.days,avg_daily:JUNE.sales/JUNE.days,avg_spend:JUNE.sales/JUNE.customers},
      {month:'2026-07',sales:JULY.sales,customers:JULY.customers,days:JULY.days,avg_daily:JULY.sales/JULY.days,avg_spend:JULY.sales/JULY.customers}
    ];
    if(EMBEDDED_DATA.bootstrap){EMBEDDED_DATA.bootstrap.active_month='2026-07';EMBEDDED_DATA.bootstrap.months=['2026-06','2026-07'];EMBEDDED_DATA.bootstrap.overview=julyOverview;}

    const bank=(EMBEDDED_DATA.bank_2026_07||[]).filter(r=>(r.sales_date||'')!=='2026-07-22');
    bank.push({deposit_date:'2026-07-23',sales_date:'2026-07-22',amount:163810,daily_sales:196500,result:'差額 −32,690円',breakdown:'108,810＋55,000',source:'通帳8頁・手書き「7/22 売上」'});
    bank.sort((a,b)=>String(a.deposit_date||'').localeCompare(String(b.deposit_date||''))||String(a.sales_date||'').localeCompare(String(b.sales_date||'')));
    EMBEDDED_DATA.bank_2026_07=bank;EMBEDDED_DATA.bank_all=bank;
  }

  function renderVerifiedConsulting(){
    const juneAvg=JUNE.sales/JUNE.days;
    const julyAvg=JULY.sales/JULY.days;
    const juneSpend=JUNE.sales/JUNE.customers;
    const julySpend=JULY.sales/JULY.customers;
    const juneCust=JUNE.customers/JUNE.days;
    const julyCust=JULY.customers/JULY.days;
    const totalDiff=JULY.sales-JUNE.sales;
    const dailyDiff=julyAvg-juneAvg;
    const spendDiff=julySpend-juneSpend;
    const custDiff=julyCust-juneCust;
    const salesGap=JULY_DAILY_SUM-JULY.sales;
    const customerGap=JULY_DAILY_CUSTOMERS-JULY.customers;

    const checks=[
      ['1','6月総売上',yen0(JUNE.sales),'確定'],
      ['2','7月月間ジャーナル総売上',yen0(JULY.sales),'確定'],
      ['3','月間総額差',signedYen(totalDiff)+'（'+pct1(totalDiff/JUNE.sales)+'）','計算一致'],
      ['4','6月平均日商',yen0(juneAvg),'計算一致'],
      ['5','7月平均日商',yen0(julyAvg),'計算一致'],
      ['6','平均日商差',signedYen(dailyDiff)+'（'+pct1(dailyDiff/juneAvg)+'）','計算一致'],
      ['7','1日平均入店数',juneCust.toFixed(1)+'人 → '+julyCust.toFixed(1)+'人','計算一致'],
      ['8','平均客単価',yen0(juneSpend)+' → '+yen0(julySpend),'計算一致'],
      ['9','7/28〜7/31売上',yen0(LAST4),'日計4枚と一致'],
      ['10','日別積上げと月間票',signedYen(salesGap)+'／'+(customerGap>0?'+':'')+customerGap+'人','未解決・要原本確認']
    ];

    $('host').innerHTML=`
      <div class="notice ok"><b>2026年7月 売上確定版</b>　月間ジャーナルの確定値を基準に表示しています。</div>
      <div class="cards" style="margin-top:12px">
        <div class="card"><div class="label">7月確定売上</div><div class="big">${yen0(JULY.sales)}</div><div class="sub">月間ジャーナル確定値</div></div>
        <div class="card"><div class="label">入店数</div><div class="big">${JULY.customers.toLocaleString()}人</div><div class="sub">月間ジャーナル確定値</div></div>
        <div class="card"><div class="label">平均客単価</div><div class="big">${yen0(julySpend)}</div><div class="sub">6月比 ${signedYen(spendDiff)}（${pct1(spendDiff/juneSpend)}）</div></div>
        <div class="card"><div class="label">平均日商</div><div class="big up">${yen0(julyAvg)}</div><div class="sub">6月比 ${signedYen(dailyDiff)}（${pct1(dailyDiff/juneAvg)}）</div></div>
        <div class="card"><div class="label">1日平均入店数</div><div class="big up">${julyCust.toFixed(1)}人</div><div class="sub">6月比 +${custDiff.toFixed(1)}人（${pct1(custDiff/juneCust)}）</div></div>
        <div class="card"><div class="label">月間総額の差</div><div class="big down">${signedYen(totalDiff)}</div><div class="sub">6月28営業日、7月27営業日（${pct1(totalDiff/JUNE.sales)}）</div></div>
        <div class="card"><div class="label">月末4日売上</div><div class="big">${yen0(LAST4)}</div><div class="sub">7/28〜7/31の日計合計</div></div>
      </div>

      <div class="panel" style="margin-top:12px"><h3>経営判断</h3>
        <div class="insight"><b>7月の月間総額は6月より${yen0(Math.abs(totalDiff))}少ない。</b><br>ただし7月は営業日が1日少なく、平均日商は${yen0(dailyDiff)}（${pct1(dailyDiff/juneAvg)}）高いため、営業日当たりの売上は改善しています。</div>
        <div class="insight"><b>客数効率と客単価も小幅改善。</b><br>1日平均入店数は${juneCust.toFixed(1)}人から${julyCust.toFixed(1)}人へ、客単価は${yen0(juneSpend)}から${yen0(julySpend)}へ上昇しています。</div>
        <div class="notice ng"><b>重要：日別積上げはまだ月間票と一致していません。</b><br>日別積上げは${yen0(JULY_DAILY_SUM)}・${JULY_DAILY_CUSTOMERS.toLocaleString()}人で、月間票より${yen0(salesGap)}・${customerGap}人多い状態です。7/22を推測で書き換える修正は撤回し、原本確認済みの196,500円・162人へ戻しました。</div>
      </div>

      <div class="panel" style="margin-top:12px"><h3>10項目検証結果</h3>${table(['No.','検証項目','結果','判定'],checks,true)}</div>
      <div class="notice" style="margin-top:12px"><b>未確定：</b>7月給与・社会保険料、日別積上げと月間票の差額32,690円・60人の発生日。これらを確定するまで営業利益と最終評価は出しません。</div>`;
  }

  applyVerifiedData();
  window.renderConsulting=renderVerifiedConsulting;

  setTimeout(async()=>{
    applyVerifiedData();
    if(typeof reloadCurrent==='function')await reloadCurrent();
    applyVerifiedData();
    window.renderConsulting=renderVerifiedConsulting;
    if(typeof state!=='undefined'&&state.tab==='consulting')renderVerifiedConsulting();
    const u=document.getElementById('updated');if(u)u.textContent='データ更新 2026/8/1（10項目再検証・推測修正撤回）';
  },250);
})();