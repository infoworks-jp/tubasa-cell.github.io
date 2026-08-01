(() => {
  const NEW_DAILY = [
    {business_date:'2026-07-28',total_sales:146640,customers:110,avg_spend:1333,issued_count:144,settlement_count:-2,settlement_amount:-2450,net_count:142,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/29 02:54。券売機日計原本から営業日7/28として反映。'},
    {business_date:'2026-07-29',total_sales:167650,customers:131,avg_spend:1279,issued_count:177,settlement_count:-2,settlement_amount:-1900,net_count:175,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/30 02:52。券売機日計原本から営業日7/29として反映。'},
    {business_date:'2026-07-30',total_sales:173080,customers:130,avg_spend:1331,issued_count:188,settlement_count:-2,settlement_amount:-1600,net_count:186,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/31 02:53。券売機日計原本から営業日7/30として反映。'},
    {business_date:'2026-07-31',total_sales:210550,customers:140,avg_spend:1503,issued_count:213,settlement_count:-3,settlement_amount:-2100,net_count:210,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時8/1 02:43。券売機日計原本から営業日7/31として反映。'}
  ];

  function applyDailySalesPatch(){
    if(typeof EMBEDDED_DATA==='undefined') return;
    const byDate = new Map((EMBEDDED_DATA.daily_2026_07 || []).map(r => [r.business_date, r]));
    NEW_DAILY.forEach(r => byDate.set(r.business_date, r));
    const july = Array.from(byDate.values()).sort((a,b)=>a.business_date.localeCompare(b.business_date));
    EMBEDDED_DATA.daily_2026_07 = july;

    const june = EMBEDDED_DATA.daily_2026_06 || [];
    EMBEDDED_DATA.daily_all = [...june, ...july].sort((a,b)=>a.business_date.localeCompare(b.business_date));

    const activeJuly = july.filter(r => Number(r.total_sales || 0) > 0);
    const julySales = activeJuly.reduce((s,r)=>s+Number(r.total_sales||0),0);
    const julyCustomers = activeJuly.reduce((s,r)=>s+Number(r.customers||0),0);
    const julyDays = activeJuly.length;
    const julyOverview = {
      month:'2026-07',
      total_sales:4995250 + julySales,
      total_customers:3587 + julyCustomers,
      total_days:28 + julyDays,
      month_sales:julySales,
      month_customers:julyCustomers,
      month_days:julyDays,
      avg_daily:julyDays ? julySales/julyDays : 0,
      avg_spend:julyCustomers ? julySales/julyCustomers : 0,
      projection:julyDays ? julySales/julyDays*31 : 0,
      month_count:2,
      avg_monthly:(4995250+julySales)/2,
      avg_customers_per_day:julyDays ? julyCustomers/julyDays : 0
    };
    EMBEDDED_DATA.overview_2026_07 = julyOverview;
    EMBEDDED_DATA.overview_all = {
      month:'all',total_sales:4995250+julySales,total_customers:3587+julyCustomers,total_days:28+julyDays,
      month_sales:4995250+julySales,month_customers:3587+julyCustomers,month_days:28+julyDays,
      avg_daily:(4995250+julySales)/(28+julyDays),avg_spend:(4995250+julySales)/(3587+julyCustomers),
      projection:0,month_count:2,avg_monthly:(4995250+julySales)/2,avg_customers_per_day:(3587+julyCustomers)/(28+julyDays)
    };
    EMBEDDED_DATA.monthly = [
      {month:'2026-06',sales:4995250,customers:3587,days:28,avg_daily:178401.7857142857,avg_spend:1392.5982715361026},
      {month:'2026-07',sales:julySales,customers:julyCustomers,days:julyDays,avg_daily:julyDays?julySales/julyDays:0,avg_spend:julyCustomers?julySales/julyCustomers:0}
    ];
    if(EMBEDDED_DATA.bootstrap){
      EMBEDDED_DATA.bootstrap.active_month='2026-07';
      EMBEDDED_DATA.bootstrap.months=['2026-06','2026-07'];
      EMBEDDED_DATA.bootstrap.overview=julyOverview;
    }

    document.querySelectorAll('.notice.ok').forEach(el=>{
      if(el.textContent.includes('売上は7月26日分まで')){
        el.textContent='公開閲覧用・売上は7月31日分まで反映（原本・残高・出金明細・給与明細は非公開）';
      }
    });
    const updated=document.getElementById('updated');
    if(updated) updated.textContent='データ更新 2026/8/1（7月31日営業分まで反映）';
  }

  applyDailySalesPatch();

  const SOCIAL_INSURANCE = {'2026-06':314440};
  function insuranceFor(month){return Number(SOCIAL_INSURANCE[month]||0)}

  async function correctedPayroll(){
    let d=await api('/api/payroll');
    if(state.scope==='month')d=d.filter(x=>x.year_month===state.month);
    if(!d.length){$('host').innerHTML='<div class="notice"><b>この月の人件費は未確定です。</b> 現在公開できる確定値は2026年6月分だけです。</div>';return}
    const r=d[0],social=insuranceFor(r.year_month),totalLabor=Number(r.salary_paid||0)+social;
    const totalRate=Number(r.monthly_sales||0)?totalLabor/Number(r.monthly_sales):0;
    const salesMinusTotalLabor=Number(r.monthly_sales||0)-totalLabor;
    $('host').innerHTML=`<div class="notice ok" style="margin-bottom:12px"><b>${ymLabel(r.year_month)}確定分・店舗全体の集計のみ公開</b>　個人名、個人別給与、給与明細画像は公開していません。</div>
    <div class="cards"><div class="card"><div class="label">社員 支給総額</div><div class="big">${yen(r.employee_gross)}</div></div><div class="card"><div class="label">アルバイト 支給総額</div><div class="big">${yen(r.parttime_gross)}</div></div><div class="card"><div class="label">給与支給総額</div><div class="big">${yen(r.salary_paid)}</div></div><div class="card"><div class="label">社会保険料</div><div class="big">${yen(social)}</div></div><div class="card"><div class="label">社会保険込み総人件費</div><div class="big">${yen(totalLabor)}</div></div><div class="card"><div class="label">総人件費率</div><div class="big">${pct(totalRate)}</div></div><div class="card"><div class="label">売上－総人件費</div><div class="big">${yen(salesMinusTotalLabor)}</div></div></div>
    <div class="panel" style="margin-top:12px"><h3>6月 総人件費分析</h3>${table(['年月','売上','社員','アルバイト','給与支給総額','社会保険料','総人件費','総人件費率','状態'],[[ymLabel(r.year_month),yen(r.monthly_sales),yen(r.employee_gross),yen(r.parttime_gross),yen(r.salary_paid),yen(social),yen(totalLabor),pct(totalRate),r.status]])}</div>`;
  }

  function correctedConsulting(){
    renderConsultingBase();
    const pay=(EMBEDDED_DATA.payroll||[])[0];
    if(!pay)return;
    const social=insuranceFor(pay.year_month),totalLabor=Number(pay.salary_paid||0)+social;
    const totalRate=Number(pay.monthly_sales||0)?totalLabor/Number(pay.monthly_sales):0;
    $('host').insertAdjacentHTML('beforeend',`<div class="panel" style="margin-top:12px"><h3>社会保険込み総人件費による経営判断</h3><div class="cards"><div class="card"><div class="label">給与支給総額</div><div class="big">${yen(pay.salary_paid)}</div></div><div class="card"><div class="label">社会保険料</div><div class="big">${yen(social)}</div></div><div class="card"><div class="label">総人件費</div><div class="big">${yen(totalLabor)}</div></div><div class="card"><div class="label">総人件費率</div><div class="big">${pct(totalRate)}</div></div></div></div>`);
  }

  window.renderPayroll=correctedPayroll;
  window.renderConsulting=correctedConsulting;

  setTimeout(async()=>{
    applyDailySalesPatch();
    if(typeof reloadCurrent==='function') await reloadCurrent();
    const updated=document.getElementById('updated');
    if(updated) updated.textContent='データ更新 2026/8/1（7月31日営業分まで反映）';
  },0);
})();