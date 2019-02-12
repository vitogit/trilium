import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

module.exports = {
  input: "./src/index.js",
  output: {format: "iife", file: "dist/index.js"},
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs({
      include: ['node_modules/**', './src/index.js' , './src/stats-plugin.js'],
      ignoreGlobal: false, // Default: false
    }),
    require("rollup-plugin-buble")({objectAssign: true}),
  ]
}
