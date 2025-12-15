import { readFileSync } from 'fs';
import { resolve } from 'path';

const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));
const baseUrl = resolve(tsconfig.compilerOptions.baseUrl || '.');

export default {
  tsconfig: './tsconfig.json',
};
