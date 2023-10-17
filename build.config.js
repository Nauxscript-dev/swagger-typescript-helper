import { defineBuildConfig } from 'unbuild'
import { main } from './package.json'

export default defineBuildConfig({
  entries: [main],
  clean: true,
  rollup: {
    output: {
      format: 'iife',
      entryFileNames: '[name].js',
    },
  },
})
