// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
     rules: {
    // Отключить запрет на any
    '@typescript-eslint/no-explicit-any': 'warn',

    "@typescript-eslint/no-unsafe-member-access":'off',

    "@typescript-eslint/no-unsafe-call": 'off',

    "@typescript-eslint/no-unsafe-assignment":'off',

    // Предупреждать о неотловленных промисах
    '@typescript-eslint/no-floating-promises': 'warn',

    // Предупреждать о небезопасных аргументах
    '@typescript-eslint/no-unsafe-argument': 'warn',

    "@typescript-eslint/no-redundant-type-constituents": 'off',

    "@typescript-eslint/no-unsafe-return":'off',

    "@typescript-eslint/no-misused-promises": 'off',

    "@typescript-eslint/require-await": "warn",
    // Проверка на стиль Prettier (с вашими настройками)
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'crlf',   // или 'lf'
        useTabs: false,       // или false
        tabWidth: 4          // ширина таба или пробелов
      }
    ],

    // Пример: запретить var
    'no-var': 'error',

    '@typescript-eslint/no-unused-vars': [
      'warn',
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    
    // Пример: максимальная длина строки
    'max-len': [
      'warn',
      {
        code: 150,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreComments: true,
        ignoreUrls: true,
        ignorePattern: '^\\s*import\\s.+\\sfrom\\s.+;$', // игнорировать длинные импорты
      }
    ]
  },
  },
);