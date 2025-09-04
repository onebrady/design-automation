// Flat config for ESLint v9 (ESM)
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'logs/**',
      'reports/**',
      'snapshots/**',
      '.husky/**',
      'fresh-project/**',
      'test-project/**'
    ]
  },
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser } },
    plugins: { import: importPlugin },
    rules: {
      ...js.configs.recommended.rules,
      // Error prevention
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      
      // Code quality
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      
      // Async/Promise handling
      'no-async-promise-executor': 'error',
      'require-await': 'warn',
      
      // Import organization
      'import/order': ['error', { 'groups': ['builtin', 'external', 'parent', 'sibling'] }],
      
      // Variable handling
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', parser: tsParser, globals: { ...globals.browser, ...globals.node } },
    plugins: { '@typescript-eslint': tsPlugin, react: reactPlugin, 'react-hooks': reactHooks, import: importPlugin },
    settings: { react: { version: 'detect' } },
    rules: {
      // TypeScript rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // Code quality
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      
      // Import organization
      'import/order': ['error', { 'groups': ['builtin', 'external', 'parent', 'sibling'] }]
    }
  }
]

