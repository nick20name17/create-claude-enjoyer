export default {
  '*.{ts,tsx,js,jsx}': ['oxlint --fix', 'oxfmt'],
  '*.{json,css,md,yml,yaml}': 'oxfmt'
}
