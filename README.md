リンガメタリカ

## Tailscaleから使う

Mac miniと利用する端末を同じtailnetに接続する。このMac miniではローカル配信をログイン時に自動起動する。手動で起動する場合は、このフォルダで実行する。

```sh
node server.mjs
```

自動起動設定を入れ直す場合は、`macos/jp.gue1971.lingua-pwa.plist` を `~/Library/LaunchAgents/` にコピーして `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/jp.gue1971.lingua-pwa.plist` を実行する。

Tailscaleの公開設定は、初回または設定を変更するときに実行する。既存の443番の配信に `/lingua/` を追加する。

```sh
tailscale serve --bg --https=443 --set-path=/lingua 8788
tailscale serve status
```

このMac miniでのURLは `https://mac-mini.tailec7e85.ts.net/lingua/`。末尾の `/` まで含めてスマートフォンで開く。AndroidではChromeの「アプリをインストール」、iPhoneではSafariの共有メニューから「ホーム画面に追加」を選ぶ。取得済みの本文・語句はオフラインでも表示できる。音声は外部サイトから取得するため、再生にはネット接続が必要。

ローカル配信は `127.0.0.1:8788` のみに待ち受ける。Tailscale Serveの443番にある他のアプリのパスは維持する。Mac miniの電源が切れている間はTailscale経由で接続できない。

- Passage 1〜20を再確認
- 数字表示の統一処理を全Passage共通に強化
- QA_CHECK.md を同梱
- タブ表示・PWA名は「リンガメタリカ」に固定


## v42
- Passage 20 の語句画面の赤字位置を修正。
- Passage 1-36 の語句画面で赤タグ欠落・粒度ズレを再点検し、登録済みデータ内の日本語語句に赤字指定を補正。


## v43
- v42 の赤字再検証。自動詞・副詞句・前置詞句まで機械的に赤字へ巻き込んだ箇所を修正。
- Passage 1 revolve / Passage 3 interact は元の赤字範囲へ戻し。
- Passage 5 imply, Passage 7 demonstrate の赤字範囲崩れを修正。
- Passage 20 の somatic / germ / transmit / repair / potent / controversial 修正は維持。

## v44
- v43 の赤字範囲を再調整。助詞・副詞句を含めるべき箇所／語幹だけ赤にする箇所／複数訳を個別赤字にする箇所を修正。
