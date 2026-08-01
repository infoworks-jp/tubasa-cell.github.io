(() => {
  const FINAL_ROWS = [
    {business_date:'2026-07-22',total_sales:196500,customers:162,avg_spend:1213,issued_count:null,settlement_count:null,settlement_amount:null,net_count:null,lunch_sales:null,evening_sales:null,late_sales:null,notes:'原本確認済み：売上196,500円・入店数162人。内訳は未確認。'},
    {business_date:'2026-07-27',total_sales:0,customers:0,avg_spend:0,issued_count:0,settlement_count:0,settlement_amount:0,net_count:0,lunch_sales:0,evening_sales:0,late_sales:0,notes:'月曜定休'},
    {business_date:'2026-07-28',total_sales:146640,customers:110,avg_spend:1333,issued_count:144,settlement_count:-2,settlement_amount:-2450,net_count:142,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/29 02:54。'},
    {business_date:'2026-07-29',total_sales:167650,customers:131,avg_spend:1279,issued_count:177,settlement_count:-2,settlement_amount:-1900,net_count:175,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/30 02:52。'},
    {business_date:'2026-07-30',total_sales:173080,customers:130,avg_spend:1331,issued_count:188,settlement_count:-2,settlement_amount:-1600,net_count:186,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時7/31 02:53。'},
    {business_date:'2026-07-31',total_sales:210550,customers:140,avg_spend:1503,issued_count:213,settlement_count:-3,settlement_amount:-2100,net_count:210,lunch_sales:null,evening_sales:null,late_sales:null,notes:'集計日時8/1 02:43。'}
  ];

  function completeJulyRows(){
    const current=[...(EMBEDDED_DATA.daily_2026_07||[])];
    const map=new Map(current.map(r=>[r.business_date,r]));
    FINAL_ROWS.forEach(r=>map.set(r.business_date,{...(map.get(r.business_date)||{}),...r}));

    // 7月1日〜31日を必ず一覧に持たせる。未登録日は勝手に0円確定せず「入力待ち」とする。
    for(let d=1;d<=31;d++){
      const date=`2026-07-${String(d).padStart(2,'0')}`;
      if(!map.has(date)){
        map.set(date,{business_date:date,total_sales:0,customers:0,avg_spend:0,issued_count:null,settlement_count:null,settlement_amount:null,net_count:null,lunch_sales:null,evening_sales:null,late_sales:null,notes:'入力待ち・原本未登録'});
      }
    }
    const rows=[...map.values()].filter(r=>r.business_date>='2026-07-01'&&r.business_date<='2026-07-31').sort((a,b)=>a.business_date.localeCompare(b.business_date));
    EMBEDDED_DATA.daily_2026_07=rows;
    return rows;
  }

  function renderDailyComplete(){
    let rows;
    if(typeof state!=='undefined'&&state.scope==='all'){
      const july=completeJulyRows();
      rows=[...(EMBEDDED_DATA.daily_2026_06||[]),...july].sort((a,b)=>a.business_date.localeCompare(b.business_date));
    }else if(typeof state!=='undefined'&&state.month==='2026-07'){
      rows=completeJulyRows();
    }else{
      rows=(typeof state!=='undefined'&&state.daily)||[];
    }
    if(typeof state!=='undefined')state.daily=rows;
    const tableRows=rows.map(r=>{
      const isWaiting=/入力待ち|未登録/.test(r.notes||'');
      const status=isWaiting?'入力待ち':(Number(r.total_sales)>0?'営業':(/休業|定休|休日/.test(r.notes||'')?'休業':'入力待ち'));
      return [r.business_date,weekdayName(r.business_date),status,yen(r.total_sales),r.customers??'',yen(r.avg_spend),r.issued_count??'',r.net_count??'',r.lunch_sales==null?'—':yen(r.lunch_sales),r.evening_sales==null?'—':yen(r.evening_sales),r.late_sales==null?'—':yen(r.late_sales),r.notes||''];
    });
    $('host').innerHTML=`<div class="notice ok" style="margin-bottom:12px"><b>7月日別一覧：7月1日〜31日を全日表示</b>　月末4日分と7月27日の定休日を追加しました。原本未登録日は「入力待ち」と表示します。</div><div class="panel">${table(['日付','曜','状態','売上','客数','客単価','発行数','正味出数','昼','夜','深夜','備考'],tableRows,true)}</div>`;
  }

  completeJulyRows();
  window.renderDaily=renderDailyComplete;

  setTimeout(()=>{
    completeJulyRows();
    window.renderDaily=renderDailyComplete;
    if(typeof state!=='undefined'&&state.tab==='daily')renderDailyComplete();
  },400);
})();