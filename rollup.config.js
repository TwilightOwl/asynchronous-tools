import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript';
import postcss from 'rollup-plugin-postcss';

const env = process.env.NODE_ENV;

const config = {
  entry: 'src/index.ts',
  dest: 'dist/asynchronous-tools.js',
  format: 'esm',
  sourceMap: true,

  plugins: [
    postcss({
      plugins: []
    }),
    nodeResolve({
      jsnext: true
    }),
    typescript({
      typescript: require("typescript"),
      target: 'es5',
      jsx: "react",
      strict: true
    }),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    })
  ],
};

export default config;