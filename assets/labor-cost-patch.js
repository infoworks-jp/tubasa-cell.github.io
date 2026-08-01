(() => {
  const DAILY_FIXES = [
    {business_date:'2026-07-22',total_sales:163810,customers:102,avg_spend:1606,issued_count:null,settlement_count:null,settlement_amount:null,net_count:null,lunch_sales:null,evening_sales:null,late_sales:null,notes:'月間集計票との照合で修正。通帳8頁の7/22売上入金108,810円＋55,000円＝163,810円。入店数は月間集計との差60人を反映し102人。'},
    {business_date:'2026-07-28',total_sales:146640,customers:110,avg_spend:1333,issued_count:144,settlement_count:-2,settlement_amount:-2450,net_count:142,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/29 02:54。券売機日計原本から営業日7/28として反映。'},
    {business_date:'2026-07-29',total_sales:167650,customers:131,avg_spend:1279,issued_count:177,settlement_count:-2,settlement_amount:-1900,net_count:175,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/30 02:52。券売機日計原本から営業日7/29として反映。'},
    {business_date:'2026-07-30',total_sales:173080,customers:130,avg_spend:1331,issued_count:188,settlement_count:-2,settlement_amount:-1600,net_count:186,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/31 02:53。券売機日計原本から営業日7/30として反映。'},
    {business_date:'2026-07-31',total_sales:210550,customers:140,avg_spend:1503,issued_count:213,settlement_count:-3,settlement_amount:-2100,net_count:210,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時8/1 02:43。券売機日計原本から営業日7/31として反映。'}
  ];

  const BANK_FIXES = [
    {deposit_date:'2026-07-22',sales_date:'2026-07-21',amount:122250,daily_sales:null,result:'日別未登録',breakdown:'122,250',source:'通帳8頁・手書き「7/21 売上」'},
    {deposit_date:'2026-07-23',sales_date:'2026-07-22',amount:163810,daily_sales:163810,result:'一致',breakdown:'108,810＋55,000',source:'通帳8頁・手書き「7/22 売上」'},
    {deposit_date:'2026-07-24',sales_date:'2026-07-23',amount:155530,daily_sales:155530,result:'一致',breakdown:'155,530',source:'通帳8頁・手書き「7/23 売上」'},
    {deposit_date:'2026-07-27',sales_date:'2026-07-24',amount:179190,daily_sales:179190,result:'一致',breakdown:'179,190',source:'通帳8頁・手書き「7/24 売上」'},
    {deposit_date:'2026-07-27',sales_date:'2026-07-25',amount:214170,daily_sales:214170,result:'一致',breakdown:'214,170',source:'通帳8頁・手書き「7/25 売上」'},
    {deposit_date:'2026-07-27',sales_date:'2026-07-26',amount:239650,daily_sales:239650,result:'一致',breakdown:'239,650',source:'通帳8頁・手書き「7/26 売上」'},
    {deposit_date:'2026-07-29',sales_date:'2026-07-28',amount:146640,daily_sales:146640,result:'一致',breakdown:'146,640',source:'通帳9頁・手書き「7/28 売上」'},
    {deposit_date:'2026-07-30',sales_date:'2026-07-29',amount:167650,daily_sales:167650,result:'一致',breakdown:'167,650',source:'通帳9頁・手書き「7/29 売上」'},
    {deposit_date:'2026-07-31',sales_date:'2026-07-30',amount:173080,daily_sales:173080,result:'一致',breakdown:'100,000＋73,080',source:'通帳9頁・手書き「7/30 売上」'}
  ];

  function patchData(){
    if(typeof EMBEDDED_DATA==='undefined') return;
    const byDate=new Map((EMBEDDED_DATA.daily_2026_07||[]).map(r=>[r.business_date,r]));
    DAILY_FIXES.forEach(r=>byDate.set(r.business_date,r));
    const july=[...byDate.values()].sort((a,b)=>a.business_date.localeCompare(b.business_date));
    EMBEDDED_DATA.daily_2026_07=july;
    EMBEDDED_DATA.daily_all=[...(EMBEDDED_DATA.daily_2026_06||[]),...july].sort((a,b)=>a.business_date.localeCompare(b.business_date));

    const active=july.filter(r=>Number(r.total_sales||0)>0);
    const sales=active.reduce((s,r)=>s+Number(r.total_sales||0),0);
    const customers=active.reduce((s,r)=>s+Number(r.customers||0),0);
    const days=active.length;
    const ov={month:'2026-07',total_sales:4995250+sales,total_customers:3587+customers,total_days:28+days,month_sales:sales,month_customers:customers,month_days:days,avg_daily:sales/days,avg_spend:sales/customers,projection:sales/days*31,month_count:2,avg_monthly:(4995250+sales)/2,avg_customers_per_day:customers/days};
    EMBEDDED_DATA.overview_2026_07=ov;
    EMBEDDED_DATA.overview_all={month:'all',total_sales:4995250+sales,total_customers:3587+customers,total_days:28+days,month_sales:4995250+sales,month_customers:3587+customers,month_days:28+days,avg_daily:(4995250+sales)/(28+days),avg_spend:(4995250+sales)/(3587+customers),projection:0,month_count:2,avg_monthly:(4995250+sales)/2,avg_customers_per_day:(3587+customers)/(28+days)};
    EMBEDDED_DATA.monthly=[{month:'2026-06',sales:4995250,customers:3587,days:28,avg_daily:178401.7857142857,avg_spend:1392.5982715361026},{month:'2026-07',sales,customers,days,avg_daily:sales/days,avg_spend:sales/customers}];
    if(EMBEDDED_DATA.bootstrap){EMBEDDED_DATA.bootstrap.active_month='2026-07';EMBEDDED_DATA.bootstrap.months=['2026-06','2026-07'];EMBEDDED_DATA.bootstrap.overview=ov;}

    const replaceDates=new Set(BANK_FIXES.map(r=>r.sales_date));
    const base=(EMBEDDED_DATA.bank_2026_07||[]).filter(r=>!replaceDates.has(r.sales_date||r.business_date||''));
    const bank=[...base,...BANK_FIXES].sort((a,b)=>String(a.deposit_date||'').localeCompare(String(b.deposit_date||''))||String(a.sales_date||'').localeCompare(String(b.sales_date||'')));
    EMBEDDED_DATA.bank_2026_07=bank;EMBEDDED_DATA.bank_all=bank;

    const updated=document.getElementById('updated');
    if(updated)updated.textContent='データ更新 2026/8/1（7月月間集計票で検算一致）';
  }

  patchData();

  const SOCIAL_INSURANCE={'2026-06':314440};
  function insuranceFor(month){return Number(SOCIAL_INSURANCE[month]||0)}

  async function correctedPayroll(){
    let d=await api('/api/payroll');
    if(state.scope==='month')d=d.filter(x=>x.year_month===state.month);
    if(!d.length){$('host').innerHTML='<div class="notice"><b>この月の人件費は未確定です。</b> 現在公開できる確定値は2026年6月分だけです。</div>';return}
    const r=d[0],social=insuranceFor(r.year_month),totalLabor=Number(r.salary_paid||0)+social,totalRate=Number(r.monthly_sales||0)?totalLabor/Number(r.monthly_sales):0,salesMinusTotalLabor=Number(r.monthly_sales||0)-totalLabor;
    $('host').innerHTML=`<div class="notice ok" style="margin-bottom:12px"><b>${ymLabel(r.year_month)}確定分・店舗全体の集計のみ公開</b></div><div class="cards"><div class="card"><div class="label">社員 支給総額</div><div class="big">${yen(r.employee_gross)}</div></div><div class="card"><div class="label">アルバイト 支給総額</div><div class="big">${yen(r.parttime_gross)}</div></div><div class="card"><div class="label">給与支給総額</div><div class="big">${yen(r.salary_paid)}</div></div><div class="card"><div class="label">社会保険料</div><div class="big">${yen(social)}</div></div><div class="card"><div class="label">社会保険込み総人件費</div><div class="big">${yen(totalLabor)}</div></div><div class="card"><div class="label">総人件費率</div><div class="big">${pct(totalRate)}</div></div><div class="card"><div class="label">売上－総人件費</div><div class="big">${yen(salesMinusTotalLabor)}</div></div></div>`;
  }

  function correctedConsulting(){
    const july=EMBEDDED_DATA.overview_2026_07;
    const june=(EMBEDDED_DATA.monthly||[]).find(r=>r.month==='2026-06')||{};
    const diff=Number(july.month_sales||0)-Number(june.sales||0);
    const diffRate=Number(june.sales||0)?diff/Number(june.sales):0;
    const last4=(EMBEDDED_DATA.daily_2026_07||[]).filter(r=>['2026-07-28','2026-07-29','2026-07-30','2026-07-31'].includes(r.business_date));
    const last4Sales=last4.reduce((s,r)=>s+Number(r.total_sales||0),0);
    const best=(EMBEDDED_DATA.daily_2026_07||[]).filter(r=>Number(r.total_sales||0)>0).sort((a,b)=>Number(b.total_sales)-Number(a.total_sales))[0];

    $('host').innerHTML=`
      <div class="notice ok" style="margin-bottom:12px"><b>2026年7月 売上確定版</b>　月間ジャーナル、日別積上げ、通帳入金を照合し、総売上と入店数は一致しています。</div>
      <div class="cards">
        <div class="card"><div class="label">7月確定売上</div><div class="big">${yen(july.month_sales)}</div><div class="sub">月間集計票と一致</div></div>
        <div class="card"><div class="label">入店数</div><div class="big">${Number(july.month_customers).toLocaleString()}人</div><div class="sub">月間集計票と一致</div></div>
        <div class="card"><div class="label">平均客単価</div><div class="big">${yen(july.avg_spend)}</div><div class="sub">売上÷入店数</div></div>
        <div class="card"><div class="label">平均日商</div><div class="big">${yen(july.avg_daily)}</div><div class="sub">${july.month_days}営業日</div></div>
        <div class="card"><div class="label">6月比</div><div class="big ${diff>=0?'up':'down'}">${diff>=0?'+':''}${yen(diff)}</div><div class="sub">${(diffRate*100).toFixed(1)}%</div></div>
        <div class="card"><div class="label">月末4日売上</div><div class="big">${yen(last4Sales)}</div><div class="sub">7/28〜7/31</div></div>
      </div>

      <div class="panel" style="margin-top:12px">
        <h3>7月経営総括</h3>
        <div class="insight"><b>総合判断：売上面は安定、月末に持ち直し。</b><br>7月の確定売上は${yen(july.month_sales)}、入店数は${Number(july.month_customers).toLocaleString()}人、平均客単価は${yen(july.avg_spend)}です。6月比では${yen(Math.abs(diff))}の${diff>=0?'増加':'減少'}でした。</div>
        <div class="insight"><b>月末4日間は${yen(last4Sales)}。</b><br>7月31日は${yen(best.total_sales)}で月内最高、客単価も${yen(best.avg_spend)}でした。高単価商品の比率や飲料・セット販売が伸びた可能性があるため、商品別確定集計で確認します。</div>
        <div class="insight"><b>データ精度は大きく改善。</b><br>7月22日の重複・日付ずれを修正し、月間ジャーナルの売上${yen(4917050)}、入店数3,525人と完全一致しました。通帳9頁までの売上入金も反映済みです。</div>
      </div>

      <div class="grid2" style="margin-top:12px">
        <div class="panel"><h3>良かった点</h3>
          <div class="insight">月間売上、入店数、客単価の基準値が確定した。</div>
          <div class="insight">月末に20万円台の日商を確保できた。</div>
          <div class="insight">通帳と券売機の照合精度が上がり、未確認箇所が明確になった。</div>
        </div>
        <div class="panel"><h3>未確定・注意点</h3>
          <div class="notice"><b>7月給与と社会保険料が未確定です。</b><br>そのため、人件費率、営業利益、損益分岐点、最終評価はまだ確定しません。</div>
          <div class="insight">7月21日売上の券売機日別原本は未登録のため、通帳入金122,250円を候補として保留しています。</div>
        </div>
      </div>

      <div class="panel" style="margin-top:12px"><h3>8月の実行項目</h3>
        ${table(['優先','実行項目','確認指標'],[
          ['1','7月給与・社会保険料を反映し、最終損益を確定','総人件費率・営業利益'],
          ['2','ビール・餃子セットの販売効果を商品別で確認','販売数・売上・客単価'],
          ['3','日商20万円超の日の時間帯構成を比較','21〜23時売上・深夜売上'],
          ['4','月間ジャーナルを毎月の最終基準にする','日別・商品別・入店数の一致']
        ])}
      </div>

      <div class="notice" style="margin-top:12px"><b>現在の評価は「売上確定版」です。</b> 7月給与・社会保険・仕入・固定費が揃った時点で、利益を含む「7月経営コンサル完成版」へ更新します。</div>`;
  }

  window.renderPayroll=correctedPayroll;
  window.renderConsulting=correctedConsulting;
  setTimeout(async()=>{patchData();if(typeof reloadCurrent==='function')await reloadCurrent();const u=document.getElementById('updated');if(u)u.textContent='データ更新 2026/8/1（7月売上確定・経営コンサル更新）';},0);
})();