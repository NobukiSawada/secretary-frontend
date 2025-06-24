## セットアップコマンド

以下のコマンドでPrettierとESLintをReact用に導入します：

```bash
npm install --save-dev prettier eslint eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev @eslint/compat @eslint/js eslint-plugin-prettier
```
```bash
npm run format
``` 
プロジェクト内の指定されたファイルを、Prettier の設定に基づいて自動で整形できるようになりました。
```bash
npm run lint
```

: ESLint のルール（React や Prettier との連携を含む）に基づいて、コードの潜在的な問題やスタイル違反をチェックできるようになりました。
```bash
git commit
```
コミットを行う際に、ステージングされているファイルに対して自動で Prettier による整形と ESLint のチェック（および自動修正）が実行され、問題があればコミットが拒否されるようになりました。