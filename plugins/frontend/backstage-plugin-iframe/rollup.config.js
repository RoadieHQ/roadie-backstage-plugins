/* eslint-disable import/no-extraneous-dependencies */
import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

export default [{
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    entryFileNames: 'index.esm.js',
    chunkFileNames: 'esm/[name]-[hash].js',
    format: 'module',
  },
  preserveEntrySignatures: 'strict',
  external: require('module').builtinModules,

  plugins: [
    peerDepsExternal({
      includeDependencies: true,
    }),
    commonjs({
      include: ['node_modules/**', '../../node_modules/**'],
      exclude: ['**/*.stories.*', '**/*.test.*'],
    }),
    esbuild({
      target: 'es2019',
    }),
    resolve({
      mainFields: ['browser', 'module', 'main'],
    }),
  ]
},

{
  input: 'dist-types/src/index.d.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
  },
  plugins: [dts()],
},
];
