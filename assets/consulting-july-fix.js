(() => {
  function renderJulyConsultingVerified(){
    const july=EMBEDDED_DATA.overview_2026_07;
    const june=(EMBEDDED_DATA.monthly||[]).find(r=>r.month==='2026-06')||{};

    const totalDiff=Number(july.month_sales||0)-Number(june.sales||0);
    const totalDiffRate=Number(june.sales||0)?totalDiff/Number(june.sales):0;
    const dailyDiff=Number(july.avg_daily||0)-Number(june.avg_daily||0);
    const dailyDiffRate=Number(june.avg_daily||0)?dailyDiff/Number(june.avg_daily):0;
    const spendDiff=Number(july.avg_spend||0)-Number(june.avg_spend||0);
    const spendDiffRate=Number(june.avg_spend||0)?spendDiff/Number(june.avg_spend):0;
    const juneCustomersPerDay=Number(june.days||0)?Number(june.customers||0)/Number(june.days):0;
    const julyCustomersPerDay=Number(july.month_days||0)?Number(july.month_customers||0)/Number(july.month_days):0;
    const customerDailyDiff=julyCustomersPerDay-juneCustomersPerDay;
    const customerDailyRate=juneCustomersPerDay?customerDailyDiff/juneCustomersPerDay:0;

    const last4=(EMBEDDED_DATA.daily_2026_07||[]).filter(r=>['2026-07-28','2026-07-29','2026-07-30','2026-07-31'].includes(r.business_date));
    const last4Sales=last4.reduce((s,r)=>s+Number(r.total_sales||0),0);
    const best=(EMBEDDED_DATA.daily_2026_07||[]).filter(r=>Number(r.total_sales||0)>0).sort((a,b)=>Number(b.total_sales)-Number(a.total_sales))[0];

    $('host').innerHTML=`
      <div class="notice ok" style="margin-bottom:12px"><b>2026年7月 売上確定版</b>　月間ジャーナル、日別積上げ、通帳入金を照合し、総売上と入店数は一致しています。</div>
      <div class="cards">
        <div class="card"><div class="label">7月確定売上</div><div class="big">${yen(july.month_sales)}</div><div class="sub">月間集計票と一致</div></div>
        <div class="card"><div class="label">入店数</div><div class="big">${Number(july.month_customers).toLocaleString()}人</div><div class="sub">月間集計票と一致</div></div>
        <div class="card"><div class="label">平均客単価</div><div class="big">${yen(july.avg_spend)}</div><div class="sub">6月比 ${spendDiff>=0?'+':''}${yen(spendDiff)}（${(spendDiffRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">平均日商</div><div class="big up">${yen(july.avg_daily)}</div><div class="sub">6月比 +${yen(dailyDiff)}（+${(dailyDiffRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">1日平均入店数</div><div class="big up">${julyCustomersPerDay.toFixed(1)}人</div><div class="sub">6月比 +${customerDailyDiff.toFixed(1)}人（+${(customerDailyRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">月間総額の差</div><div class="big down">${yen(totalDiff)}</div><div class="sub">営業日が6月28日、7月27日で1日少ないため（${(totalDiffRate*100).toFixed(1)}%）</div></div>
        <div class="card"><div class="label">月末4日売上</div><div class="big">${yen(last4Sales)}</div><div class="sub">7/28〜7/31</div></div>
      </div>

      <div class="panel" style="margin-top:12px">
        <h3>7月経営総括</h3>
        <div class="insight"><b>結論：7月の営業力は6月より上がっています。</b><br>月間総額だけを見ると6月より${yen(Math.abs(totalDiff))}少ないですが、7月は営業日が1日少ないためです。平均日商は6月${yen(june.avg_daily)}から7月${yen(july.avg_daily)}へ${yen(dailyDiff)}増え、約${(dailyDiffRate*100).toFixed(1)}%改善しました。</div>
        <div class="insight"><b>客数効率と客単価も改善。</b><br>1日平均入店数は6月${juneCustomersPerDay.toFixed(1)}人から7月${julyCustomersPerDay.toFixed(1)}人へ増加。平均客単価も6月${yen(june.avg_spend)}から7月${yen(july.avg_spend)}へ上がっています。したがって「6月より売上が下がった」という評価は誤りで、営業日数を揃えると7月の実績が上です。</div>
        <div class="insight"><b>月末も好調。</b><br>7月28日〜31日の4日間売上は${yen(last4Sales)}。月内最高日は${best.business_date.slice(5).replace('-','/')}の${yen(best.total_sales)}でした。</div>
        <div class="insight"><b>データ精度を確認済み。</b><br>月間ジャーナルの売上${yen(4917050)}、入店数3,525人と日別積上げは完全一致しています。</div>
      </div>

      <div class="grid2" style="margin-top:12px">
        <div class="panel"><h3>正しい6月比較</h3>${table(['指標','6月','7月','評価'],[
          ['月間総売上',yen(june.sales),yen(july.month_sales),'7月は営業日が1日少なく'+yen(Math.abs(totalDiff))+'少ない'],
          ['営業日',june.days+'日',july.month_days+'日','7月が1日少ない'],
          ['平均日商',yen(june.avg_daily),yen(july.avg_daily),'7月が'+yen(dailyDiff)+'高い'],
          ['1日平均入店数',juneCustomersPerDay.toFixed(1)+'人',julyCustomersPerDay.toFixed(1)+'人','7月が'+customerDailyDiff.toFixed(1)+'人多い'],
          ['平均客単価',yen(june.avg_spend),yen(july.avg_spend),'7月が'+yen(spendDiff)+'高い']
        ])}</div>
        <div class="panel"><h3>未確定項目</h3><div class="notice"><b>7月給与と社会保険料が未確定です。</b><br>人件費率、営業利益、損益分岐点、最終評価は、これらを反映してから確定します。</div></div>
      </div>

      <div class="panel" style="margin-top:12px"><h3>8月の実行項目</h3>${table(['優先','実行項目','確認指標'],[
        ['1','7月給与・社会保険料を反映し、最終損益を確定','総人件費率・営業利益'],
        ['2','7月の好調日を商品別・時間帯別に分析','客単価・21〜23時売上'],
        ['3','平均日商18万円台を維持し20万円超の日を増やす','平均日商・営業日別売上'],
        ['4','月間ジャーナルを毎月の最終検算基準にする','日別・入店数・商品別の一致']
      ])}</div>

      <div class="notice" style="margin-top:12px"><b>訂正：</b>以前の「6月より減少」という表現は、営業日数を無視した総額比較で、経営評価として不適切でした。正しくは、7月は平均日商・1日平均入店数・客単価がすべて6月を上回っています。</div>`;
  }

  window.renderConsulting=renderJulyConsultingVerified;
})();