import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: new URL('.', import.meta.url).pathname,
});

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts', 'postcss.config.mjs'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default config;
