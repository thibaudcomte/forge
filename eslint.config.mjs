// @ts-check

import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['.angular', 'node_modules', 'android', 'dist']),
  {
    extends: [tseslint.configs.recommended, tseslint.configs.stylistic],
  },
]);
