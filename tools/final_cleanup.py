from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

s = s.replace(
    '社会保険の金額が分からない、支出先が分からない、という旧判断は撤回済みです。確定情報を基準に経営判断します。',
    '社会保険314,440円を含め、今回照会した支出はすべて金額・費目を確定済みです。確定情報を基準に経営判断します。'
)

for forbidden in [
    '社会保険の金額が分からない',
    '社会保険金額がわからない',
    '会社負担社会保険等を含まないため',
    '要確認支出が利益判定を止めています',
    'NSS.ジロウ？',
    'const tx=(e.transactions||[]).map(x=>[x.date,x.payee,yen(x.amount),x.category,x.status]);const tx=',
]:
    if forbidden in s:
        raise SystemExit('forbidden text remains: ' + forbidden)

for required in [
    '社会保険314,440円',
    '社労士顧問料22,000円',
    '要確認支出は¥0',
    '確認対象はすべて分類済み',
]:
    if required not in s:
        raise SystemExit('required text missing: ' + required)

p.write_text(s, encoding='utf-8')
print('Final wording and JavaScript checks passed')
