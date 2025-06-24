import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";

// `eslint-config-prettier` はルールそのものではなく、競合回避のための設定であり、
// Flat Configでは多くの場合 `plugins` や `rules` と一緒にオブジェクトとして配列に直接含める形になります。
// ここでの import は不要な場合が多いですが、もし明示的に設定オブジェクトをインポートするなら使います。
// 今回は単純化のため、この行は削除します。
// import prettierConfig from "eslint-config-prettier"; // ★この行を削除します★

import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    // グローバルな設定（ファイル全体に適用される設定）
    files: ["src/**/*.{js,jsx}", "eslint.config.js", "vite.config.js"], // lint 対象に設定ファイル自身も追加
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true, // JSXを有効にする
        },
      },
      globals: {
        ...globals.browser, // ブラウザ環境のグローバル変数を有効化 (window, documentなど)
        // ...globals.node, // 必要であればNode.js環境のグローバル変数を有効化
      },
    },
    // ★★★ ここに settings プロパティを追加 ★★★
    settings: {
      react: {
        version: "detect", // インストールされているReactのバージョンを自動検出
      },
    },
  },
  pluginJs.configs.recommended, // ESLintの推奨ルールを適用
  ...fixupConfigRules(pluginReactConfig), // Reactの推奨ルールを適用（Prettierと併用するためfixupConfigRulesを使う）

  // ★★★ ここに eslint-plugin-prettier の設定と eslint-config-prettier を追加 ★★★
  // eslint-config-prettier は、eslint-plugin-prettier の後に置くことで
  // 競合するルールを正しく無効化します。
  // 注意: `eslint-config-prettier` は Flat Config ではオブジェクトとしてインポートする形になるため、
  // npmパッケージのバージョンによってインポート方法が異なります。
  // もし import `prettierConfig` がエラーになる場合は、以下の代替案を試してください。

  // 代替案A (一般的な Flat Config の場合):
  // ESLint v8.x の Flat Config では、eslint-config-prettier は `plugins` や `rules` と同じ階層で
  // オブジェクトとして追加されることが多いです。
  // `eslint-plugin-prettier` のルールは `prettier/prettier` と書くことで有効化します。
  {
    plugins: {
      prettier: prettierPlugin, // Prettierプラグインを登録
    },
    rules: {
      "prettier/prettier": "error", // Prettierの整形ルールに反する場合、エラーとする
      "react/react-in-jsx-scope": "off", // React 17以降はJSXでのReactインポートが不要なため無効化
      "react/prop-types": "off", // PropTypesを使用しない場合は無効化
      // `eslint-config-prettier` の競合回避ルールは、`prettier/prettier` を使うことで
      // 自動的に考慮されるため、多くの場合明示的なインポートやextendsは不要になります。
      // もし必要であれば、`@eslint/config-prettier` のような専用のFlat Config形式のパッケージがあるか確認します。
    },
  },

  {
    // Ignore patterns (無視するファイル/ディレクトリ)
    ignores: ["dist/", "node_modules/"],
  },
];
