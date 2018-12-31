# node-red-contrib-nature-remo

Nature Remoのコントローラ

## 公式API

https://developer.nature.global/ 

1. アクセストークンを取得する

以下のURLにアクセスし、トークンを発行し、トークン文字列をコピーする。

http://home.nature.global/

2. アプライアンス設定を取得する

コマンドラインで以下のcurlコマンドを実行し、設定をJSONファイルとして保存する。

$ curl "https://api.nature.global/1/appliances" -H "accept: application/json" -k --header "Authorization: Bearer $(TOKEN)" > appliances.json

## 設定

- token: アクセストークン文字列を設定する
- appliances: アプライアンス設定ファイルの絶対パスを指定する

## Input

mag.payloadnにjsonでコマンドを指定する

{
  "commands": [
    {
      "nickname": "テレビ",
      "name": "電源",
      "after_wait": 4000
    },
    {
      "before_wait": 1000,
      "nickname": "テレビ",
      "name": "地上波"
    }
  ]
}
