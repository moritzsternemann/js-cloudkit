const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  entry: './lib/_index.js',
  output: {
    filename: 'module.js',
    path: path.resolve(__dirname, '..', 'dist/'),
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: "'production'" })
    })
  ]
})

module.exports = webpackConfig
