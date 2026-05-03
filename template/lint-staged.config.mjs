export default {
  '*.{ts,tsx,js,jsx}': ['oxlint --fix', 'oxfmt', () => 'tsc -b --noEmit'],
  '*.{json,css,md}': 'oxfmt'
}
