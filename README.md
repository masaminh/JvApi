# JVData取得用API

## デプロイに必要なコンテキスト値

| キー | 値 | 必須 |
| --- | --- | --- |
| jvdataBucket | JVDataが格納されているS3バケット名 | ⚪︎ |
| jvdataPrefix | JVDataが格納されているS3バケット内のプレフィックス | ⚪︎ |
| stage | ステージ名 (パラメータストア名に使用) | ⚪︎ |
| stackName | スタック名 | - |

## デプロイ
```npx cdk deploy```
> [!Note]
> 必要に応じてコンテキスト値の設定を行うこと

## JVDataの格納

### S3上の格納キー

| データ種別 | S3上のキー |
| -- | -- |
| RA | (jvdataPrefixで指定した文字列)/RACE/(西暦4桁)/(月2桁)/(日2桁)/(レースID16桁)/RA(レースID16桁).tar.gz |
| SE | (jvdataPrefixで指定した文字列)/RACE/(西暦4桁)/(月2桁)/(日2桁)/(レースID16桁)/RA(レースID16桁)(馬番2桁)(血統登録番号10桁).tar.gz |
| TK | (jvdataPrefixで指定した文字列)/RACE/(西暦4桁)/(月2桁)/(日2桁)/(レースID16桁)/TK(レースID16桁).tar.gz |

### ファイル形式

以下をtar.gz形式で固めたもの

| ファイル名 | 内容 |
| -- | -- |
| properties.json | 以下に記載 |
| data | JVLinkで取得してきたバイト列そのもの |

properties.json
```JSON
{
   "JvlinkVersion": "JVLinkのバージョン"
}
```
