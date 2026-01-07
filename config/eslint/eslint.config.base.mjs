// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import checkFile from 'eslint-plugin-check-file';
import eslintPluginPath from 'eslint-plugin-path';
import importPrettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import hexagonalPlugin from '../../tools/eslint-plugin-hexagonal/clean-architecture-rules.mjs';

export default defineConfig([
  {
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/no-index': [
        'error',
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-match-with-fex': [
        'error',
        {
          '*.test.{js,jsx,ts,tsx}': '**/__test?(s)__/',
        },
      ],
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/**/!(__test?(s)__)/': 'KEBAB_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/!(__test?(s)__)/': 'KEBAB_CASE',
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts*'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, prettier],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      // @ts-ignore
      path: eslintPluginPath,
      // @ts-ignore
      hexagonal: hexagonalPlugin,
      import: importPrettier,
      'unused-imports': unusedImports,
    },
    rules: {
      eqeqeq: 'error',
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: ['function', 'export'],
          next: '*',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['function', 'export'],
        },
      ],
      'no-return-assign': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-duplicate-imports': 'error',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      'max-depth': ['error', 3],
      'max-nested-callbacks': ['error', 3],
      'no-console': ['error', { allow: ['error', 'warn', 'info'] }],
      'no-empty': 'error',
      'no-eq-null': 'error',
      'no-floating-decimal': 'error',
      'no-magic-numbers': 'off',
      'no-nested-ternary': 'error',
      'no-new': 'error',
      'path/no-relative-imports': 'error',
      'hexagonal/no-invalid-architecture-imports': ['error'],
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: false,
          allowTaggedTemplates: false,
        },
      ],
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'max-lines-per-function': ['error', 80],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^[A-Z_]',
        },
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
        },
      ],
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignoreReadonlyClassProperties: true,
          ignoreNumericLiteralTypes: true,
          ignore: [-1, 0, 1],
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        {
          selector: 'method',
          format: ['camelCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'property',
          format: null,
          filter: {
            regex: '^(host)$',
            match: false,
          },
        },
        {
          selector: 'method',
          modifiers: ['override'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'objectLiteralMethod',
          format: ['camelCase', 'UPPER_CASE'],
        },
      ],
      complexity: 'error',
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      'no-invalid-this': 'off',
      '@typescript-eslint/no-invalid-this': ['error'],
    },
  },
]);
