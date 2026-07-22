import json,re
from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
m=re.search(r'const EMBEDDED_DATA=(\{.*?\});\s*\n',s,re.S)
if not m:
    raise SystemExit('EMBEDDED_DATA not found')
data=json.loads(m.group(1))

new_daily=[
 {"business_date":"2026-07-16","total_sales":165380,"customers":121,"avg_spend":1367,"issued_count":None,"settlement_count":None,"settlement_amount":None,"net_count":None,"lunch_sales":None,"evening_sales":None,"late_sales":None,"notes":"集計日時7/17を営業日7/16として反映。内訳未確認は要確認。"},
 {"business_date":"2026-07-17","total_sales":152120,"customers":109,"avg_spend":1396,"issued_count":161,"settlement_count":-2,"settlement_amount":-1800,"net_count":159,"lunch_sales":19630,"evening_sales":87740,"late_sales":46550,"notes":"集計日時7/18を営業日7/17として反映。通帳入金一致。"},
 {"business_date":"2026-07-18","total_sales":138580,"customers":102,"avg_spend":1359,"issued_count":149,"settlement_count":-2,"settlement_amount":-1600,"net_count":147,"lunch_sales":25630,"evening_sales":85720,"late_sales":28830,"notes":"集計日時7/19を営業日7/18として反映。通帳入金一致。"},
 {"business_date":"2026-07-19","total_sales":278000,"customers":199,"avg_spend":1397,"issued_count":293,"settlement_count":0,"settlement_amount":0,"net_count":293,"lunch_sales":74620,"evening_sales":157520,"late_sales":45860,"notes":"集計日時7/20を営業日7/19として反映。通帳入金一致。"},
 {"business_date":"2026-07-20","total_sales":122250,"customers":85,"avg_spend":1438,"issued_count":125,"settlement_count":-2,"settlement_amount":-1600,"net_count":123,"lunch_sales":17360,"evening_sales":81730,"late_sales":24760,"notes":"集計日時7/22を営業日7/20として反映。7/21月曜は定休日。通帳未確認。"}
]

# 日別データを一つの7月配列へ統合
key='daily_2026-07'
arr=data.get(key,[])
by={x.get('business_date'):x for x in arr}
for x in new_daily: by[x['business_date']]=x
data[key]=sorted(by.values(),key=lambda x:x['business_date'])

# 月次・概要を日別確定値から再計算
july=data[key]
ms=sum(int(x.get('total_sales') or 0) for x in july)
mc=sum(int(x.get('customers') or 0) for x in july)
md=len([x for x in july if int(x.get('total_sales') or 0)>0])
bs=data.setdefault('bootstrap',{})
ov=bs.setdefault('overview',{})
ov.update({"month":"2026-07","month_sales":ms,"month_customers":mc,"month_days":md,"avg_daily":ms/md if md else 0,"avg_spend":ms/mc if mc else 0,"projection":ms/md*27 if md else 0})
bs['active_month']='2026-07'
if 'months' in bs and '2026-07' not in bs['months']: bs['months'].append('2026-07')

# monthly配列が存在する場合も同期
for k,v in list(data.items()):
    if isinstance(v,list) and ('monthly' in k.lower() or k=='monthly'):
        for row in v:
            if isinstance(row,dict) and (row.get('month')=='2026-07' or row.get('ym')=='2026-07'):
                for fld,val in [('total_sales',ms),('sales',ms),('month_sales',ms),('customers',mc),('total_customers',mc),('days',md),('month_days',md),('avg_daily',ms/md if md else 0),('avg_spend',ms/mc if mc else 0)]:
                    if fld in row: row[fld]=val

# 通帳照合を追加（既存構造を壊さず、対応する配列があれば追記）
bank_rows=[
 {"business_date":"2026-07-17","deposit_date":"2026-07-21","sales":152120,"deposit":152120,"difference":0,"status":"一致"},
 {"business_date":"2026-07-18","deposit_date":"2026-07-21","sales":138580,"deposit":138580,"difference":0,"status":"一致"},
 {"business_date":"2026-07-19","deposit_date":"2026-07-21","sales":278000,"deposit":278000,"difference":0,"status":"一致"},
 {"business_date":"2026-07-20","deposit_date":None,"sales":122250,"deposit":None,"difference":None,"status":"通帳未確認"}
]
for k,v in list(data.items()):
    if isinstance(v,list) and 'bank' in k.lower() and ('2026-07' in k or k=='bank'):
        old={str(x.get('business_date') or x.get('sales_date')):x for x in v if isinstance(x,dict)}
        for r in bank_rows: old[r['business_date']]=r
        data[k]=list(old.values())

new_json=json.dumps(data,ensure_ascii=False,separators=(',',':'))
s=s[:m.start(1)]+new_json+s[m.end(1):]
s=s.replace('売上は7月15日分まで','売上は7月20日分まで')
s=s.replace('7月15日分まで','7月20日分まで')

# 目的基準の自己検証を埋め込む。必須機能が欠落したら生成自体を失敗させる。
required=['月別経営分析','経営コンサル','商品別・全商品','ABC分析','ビール・セット','時間帯','売上入金照合','品質検証']
missing=[x for x in required if x not in s]
if missing: raise SystemExit('required features missing: '+','.join(missing))
for d in ['2026-07-16','2026-07-17','2026-07-18','2026-07-19','2026-07-20']:
    if d not in s: raise SystemExit('daily row missing: '+d)
if sum(x['total_sales'] for x in new_daily)!=856330 or sum(x['customers'] for x in new_daily)!=616:
    raise SystemExit('new daily control total mismatch')
p.write_text(s,encoding='utf-8')
print(f'July rebuilt: sales={ms:,} customers={mc:,} days={md}')
