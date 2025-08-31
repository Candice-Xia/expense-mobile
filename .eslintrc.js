module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',
    'no-self-assign': 'warn',
    'no-undef': 'warn',
    'no-useless-escape': 'warn',
    'no-redeclare': 'warn',
    'no-dupe-keys': 'warn',
    'no-prototype-builtins': 'warn',
    'no-empty': 'warn',
    'vue/multi-word-component-names': 'warn',
    'vue/no-v-for-template-key-on-child': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/no-v-text-v-html-on-component': 'warn',
    'vue/no-deprecated-slot-attribute': 'warn',
    'vue/no-deprecated-v-on-native-modifier': 'warn',
    'vue/no-side-effects-in-computed-properties': 'warn',
  }
}
