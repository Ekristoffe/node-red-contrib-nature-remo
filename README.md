# node-red-contrib-nature-remo

Nature Remoのコントローラ

## Nature Remo API

公式API

https://developer.nature.global/ 

1. アクセストークンを取得する

以下のURLにアクセスし、トークンを発行し、トークン文字列をコピーする。

http://home.nature.global/

2. アプライアンス設定を取得する

コマンドラインで以下のcurlコマンドを実行し、設定をJSONファイルとして保存する。

$ curl -i "https://api.nature.global/1/appliances" -H "accept: application/json" -k --header "Authorization: Bearer $(TOKEN)" > appliances.json

## 設定

- token: token
- appliances: appliances
