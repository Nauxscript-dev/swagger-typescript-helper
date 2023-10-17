import { defineConfig } from 'rollup'
import monkeyScriptDeclare from './monkeyScriptDeclare.mjs'

export default defineConfig({
  input: './src/index.js',
  output: {
    format: 'iife',
    file: 'dist/index.js',
    banner: monkeyScriptDeclare,
  },
})
