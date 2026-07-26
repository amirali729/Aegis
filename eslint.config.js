import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Backend
  {
    files: ['src/**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },

      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // SDK
  {
    files: ['sdk/core/src/**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: './sdk/core/tsconfig.json',
      },

      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  {
    ignores: ['dist/', 'node_modules/', 'sdk/core/dist/', 'vitest.config.ts'],
  },
];
