import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginSuitescript from 'eslint-plugin-suitescript'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginJest from 'eslint-plugin-jest'

/** @type {import('eslint').Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    {
        plugins: {
            jest: pluginJest,
        },
        rules: {
            'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error',
        },
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.amd,
                ...globals.node,
                ...globals.browser,
            },
        },

        plugins: {
            suitescript: pluginSuitescript,
        },
        rules: {
            'suitescript/api-version': 'error',
            'suitescript/no-extra-modules': 'error',
            'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error',
        },
    },
    eslintConfigPrettier,
]
