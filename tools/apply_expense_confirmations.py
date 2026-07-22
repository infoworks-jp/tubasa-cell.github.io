import json,re
from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
m=re.search(r'const EMBEDDED_DATA=(\{.*?\});\s*\n',s,re.S)
if not m:
    raise SystemExit('EMBEDDED_DATA not found')
data=json.loads(m.group(1))

# 加来さん確認済みの支出分類。総額は従来の主要出金合計7,697,331円を維持。
categories=[
 {'name':'仕入・外注支払','amount':3390475,'status':'PDF集計額。既確認取引先を含む'},
 {'name':'給与','amount':2140844,'status':'従来給与1,679,049円＋6/30アルバイト給与461,795円'},
 {'name':'要確認支出','amount':22000,'status':'6/22・22,000円のみ未確認'},
 {'name':'税・社会保険等','amount':628880,'status':'5/29ペイジー314,440円は社会保険と確認済み'},
 {'name':'現金経費引出','amount':427702,'status':'6/23・3,942円は経費と確認済み'},
 {'name':'役員・関係者支払','amount':123466,'status':'既存分類'},
 {'name':'通信費','amount':18142,'status':'既存分類'},
 {'name':'銀行手数料','amount':9680,'status':'6/23・550円は小銭両替手数料と確認済み'},
 {'name':'通信・システム費','amount':3300,'status':'既存分類'},
 {'name':'食材仕入（のうゆう）','amount':436987,'status':'6/1・チャーシュー等の肉類'},
 {'name':'社長立替経費精算','amount':243049,'status':'6/2・領収書精算、社長分'},
 {'name':'岡税理士事務所 顧問料','amount':49896,'status':'6/3・7月各24,948円。定額、決算月は増額'},
 {'name':'北海道ガス ガス代','amount':202910,'status':'6/10確認済み'}
]
transactions=[
 {'date':'2026-05-29','payee':'北海道振興株式会社','amount':531187,'category':'店舗固定費・光熱費','status':'確認済み'},
 {'date':'2026-05-29','payee':'藤井表具','amount':315700,'category':'カウンター改造・修理','status':'確認済み'},
 {'date':'2026-05-29','payee':'ペイジー','amount':314440,'category':'社会保険','status':'確認済み'},
 {'date':'2026-06-01','payee':'のうゆう','amount':436987,'category':'食材仕入・チャーシュー等肉類','status':'確認済み'},
 {'date':'2026-06-02','payee':'社長分','amount':243049,'category':'領収書精算・立替経費','status':'確認済み'},
 {'date':'2026-06-03','payee':'岡税理士事務所','amount':24948,'category':'税理士顧問料','status':'定額。決算月は増額'},
 {'date':'2026-06-10','payee':'北海道ガス','amount':202910,'category':'ガス代','status':'確認済み'},
 {'date':'2026-06-10','payee':'株式会社ジョブマーケティング北海道','amount':184557,'category':'求人広告費','status':'確認済み'},
 {'date':'2026-06-10','payee':'マルカツ製麺','amount':294284,'category':'麺・餃子仕入','status':'確認済み'},
 {'date':'2026-06-22','payee':'NSS.ジロウ？','amount':22000,'category':'要確認','status':'未確認'},
 {'date':'2026-06-23','payee':'経費','amount':3942,'category':'現金経費','status':'用途詳細は未分解'},
 {'date':'2026-06-23','payee':'両替','amount':550,'category':'小銭両替手数料','status':'確認済み'},
 {'date':'2026-06-30','payee':'アルバイト','amount':461795,'category':'アルバイト給与','status':'確認済み'},
 {'date':'2026-06-30','payee':'北海道振興株式会社','amount':541957,'category':'店舗固定費・光熱費','status':'確認済み'},
 {'date':'2026-07-01','payee':'岡税理士事務所','amount':24948,'category':'税理士顧問料','status':'定額。正確な引落日は通帳原本で要確認'},
 {'date':'2026-07-08','payee':'マルカツ製麺','amount':323469,'category':'麺・餃子仕入','status':'確認済み'}
]
examples=[
 {'payee':'のうゆう（6/1）','amount':436987,'status':'食材仕入・チャーシュー等肉類'},
 {'payee':'社長分（6/2）','amount':243049,'status':'領収書精算・立替経費'},
 {'payee':'岡税理士事務所（6/3）','amount':24948,'status':'税理士顧問料'},
 {'payee':'北海道ガス（6/10）','amount':202910,'status':'ガス代'},
 {'payee':'アルバイト（6/30）','amount':461795,'status':'給与'},
 {'payee':'NSS.ジロウ？（6/22）','amount':22000,'status':'唯一の未確認支出'}
]

data['expenses']={'categories':categories,'transactions':transactions,'examples':examples,'total':7697331,'unknown_total':22000,'confirmed_at':'2026-07-22'}
new_json=json.dumps(data,ensure_ascii=False,separators=(',',':'))
s=s[:m.start(1)]+new_json+s[m.end(1):]

# 表示文言を現在の確認状況へ更新
s=s.replace('要確認支出1,416,637円が利益判定を止めています。','要確認支出は22,000円まで縮小しました。')
s=s.replace('この支出を費目確定せずに経営判断すると、原価率・人件費率・固定費率のすべてが歪みます。金額の大きい順に摘要、請求書、領収書を照合するのが最短です。','従来1,416,637円あった要確認支出のうち1,394,637円を分類できました。残る6月22日の22,000円を確認すれば、この要確認枠は解消できます。')
s=s.replace('①仕入・外注3,390,475円を取引先別に分解、②要確認支出1,416,637円を確定、③発生月と支払月を分離、④商品別売上と材料原価を接続、⑤月別営業利益と資金繰りを同時表示','①仕入・外注3,390,475円を取引先別に分解、②残る6月22日22,000円を確認、③発生月と支払月を分離、④商品別売上と材料原価を接続、⑤月別営業利益と資金繰りを同時表示')

# 支出画面に日付別の確認済み一覧を追加
old="const ex=(e.examples||[]).map(x=>[x.payee,yen(x.amount),x.status]);"
new="const ex=(e.examples||[]).map(x=>[x.payee,yen(x.amount),x.status]);const tx=(e.transactions||[]).map(x=>[x.date,x.payee,yen(x.amount),x.category,x.status]);"
s=s.replace(old,new)
old2="<div class=\"panel\" style=\"margin-top:12px\"><h3>仕入・外注支払の通帳確認例</h3>${table(['通帳摘要・相手先','金額','状態'],ex,true)}<div class=\"sub\">例示行であり、3,390,475円の全内訳ではありません。</div></div>"
new2="<div class=\"panel\" style=\"margin-top:12px\"><h3>日付別・確認済み支出一覧</h3>${table(['日付','相手先','金額','分類','状態'],tx,true)}</div><div class=\"panel\" style=\"margin-top:12px\"><h3>確認結果の要点</h3>${table(['相手先・日付','金額','状態'],ex,true)}</div>"
s=s.replace(old2,new2)

# 検証
if sum(x['amount'] for x in categories)!=7697331:
    raise SystemExit('expense total mismatch')
if data['expenses']['unknown_total']!=22000:
    raise SystemExit('unknown total mismatch')
for token in ['のうゆう','藤井表具','ジョブマーケティング北海道','岡税理士事務所','北海道ガス','アルバイト給与','NSS.ジロウ？']:
    if token not in s:
        raise SystemExit('missing confirmation: '+token)
p.write_text(s,encoding='utf-8')
print('Expense confirmations applied; unknown=22,000 yen')
