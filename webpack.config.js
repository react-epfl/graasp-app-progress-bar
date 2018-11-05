const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    // here we define the variables that are passed to
    new webpack.EnvironmentPlugin({
      'process.env.NODE_ENV': process.env.NODE_ENV,
      'process.env.DEBUG': process.env.DEBUG || false,
      GRAASP_HOST: process.env.GRAASP_HOST,
      GRAASP_DOMAIN: process.env.GRAASP_DOMAIN,
      DOMAIN: process.env.DOMAIN,
    }),
  ],
};
