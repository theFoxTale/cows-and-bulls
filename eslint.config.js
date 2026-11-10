import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['node_modules', 'dist', 'coverage'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      unicorn,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      unicorn.configs.recommended,
      prettierConfig,
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],

      // Unicorn, отключённые правила
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/prefer-event-target': 'off',
      'unicorn/numeric-separators-style': 'off',

      'unicorn/name-replacements': [
        'error',
        {
          allowList: {
            acc: true,
            env: true,
            i: true,
            j: true,
            idx: true,
            e: true, // event
            el: true, // element
            cb: true, // callback
            fn: true, // function
          },
        },
      ],

      'max-lines-per-function': ['error', 50],
      'no-console': 'off',
      'no-plusplus': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Тесты
    files: ['tests/**/*.ts', '**/*.test.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'unicorn/prevent-abbreviations': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
  {
    // Конфиги
    files: ['vite.config.ts', 'vitest.config.ts', '*.config.{js,ts}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { project: false },
    },
  },
]);
