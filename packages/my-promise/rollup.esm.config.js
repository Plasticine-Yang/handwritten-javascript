import { resolve } from 'path'
import esbuild from 'rollup-plugin-esbuild'
import nodeResolve from '@rollup/plugin-node-resolve'

const resolvePath = resolve.bind(null, __dirname)

/** @type { import('rollup').RollupOptions } */
export default {
  input: resolvePath('src/index.ts'),
  output: [
    {
      dir: resolvePath('dist/esm'),
      format: 'esm',
      preserveModules: true
    },
    {
      dir: resolvePath('dist/cjs'),
      format: 'cjs',
      preserveModules: true,
      exports: 'auto'
    }
  ],
  plugins: [nodeResolve(), esbuild({ target: 'esnext' })]
}
