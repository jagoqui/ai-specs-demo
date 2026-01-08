// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// @ts-check
import {defineConfig} from 'eslint/config';
import baseConfig from './config/eslint/eslint.config.base.mjs';
import reactConfig from './config/eslint/eslint.config.react.mjs';
import testConfig from './config/eslint/eslint.config.test.mjs';

export default defineConfig([
  {
    ignores: ['src/**/shadcn/**'],
  },
  {
    extends: [baseConfig, reactConfig, testConfig],
  },
]);
