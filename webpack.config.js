/*
  eslint-disable unicorn/prevent-abbreviations,
  import/no-commonjs,eqeqeq,func-style,filenames/match-regex,import/unambiguous
*/
const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin-next');
const ZipFilesPlugin = require('webpack-zip-files-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const getOutputPath = () => {
  return isProduction ? './dist/' : './dev/';
};

module.exports = {
  devtool: isProduction ? false : 'source-map',
  entry: {
    'background.js': './src/main/background/.tmp/background.js',
    'discarded.js': './src/main/discarded/main.js',
    'options.js': './src/main/options/main.js',
    'options-styles': './src/main/options/styles/options-styles.scss',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        exclude: [/node_modules/, /discarded/, /options/, /.tmp/],
        loader: 'eslint-loader',
        options: {
          emitWarning: true,
          failOnError: false,
          failOnWarning: false,
        },
        test: /\.js$/,
      },
      {
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: [
            'add-filehash',
            // 'istanbul' <- TODO use only in test mode
            ['@babel/plugin-transform-runtime', {regenerator: true}],
            ['babel-plugin-root-import', {rootPathSuffix: 'src/'}],
            ['@babel/plugin-proposal-decorators', {legacy: true}],
            '@babel/plugin-transform-spread',
          ],
          presets: ['@babel/preset-env'],
        },
        test: /\.js$/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader'},
          {
            loader: 'sass-loader',
            options: {sourceMap: !isProduction},
          },
        ],
      },
      {
        loader: [
          'file-loader?publicPath=./&name=[name].[ext]',
          'image-webpack-loader'],
        test: /\.(png|ico)$/,
      },
    ],
  },
  node: {
    fs: 'empty',
  },
  optimization: {
    minimizer: isProduction ? [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({}),
    ] : [],
  },
  output: {
    filename (chunkData) {
      return chunkData.chunk.name.includes('.js') ?
        './[name]' :
        './[name].tmp';
    },
    path: path.resolve(__dirname, getOutputPath()),
    publicPath: '/',
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new PurgecssPlugin({
      paths: glob.sync('src/main/**/*.html'),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
      },
    }),
    new WebpackShellPlugin({
      onBuildStart: {
        blocking: true,
        parallel: false,
        scripts: [
          `del-cli -f  ${getOutputPath()}`,
          `html-includes --src src/main/options --dest ${getOutputPath()} --minify`,
          `del-cli -f ${getOutputPath()}*.tmp`,
        ],
      },
    }),
    new CopyWebpackPlugin((() => {
      const files = [
        {from: './assets/fox-16px.png', to: 'fox-16px.png'},
        {from: './assets/fox-48px.png', to: 'fox-48px.png'},
        {from: './assets/fox-96px.png', to: 'fox-96px.png'},
        {from: './src/main/background/.tmp/service.wasm', to: 'service.wasm'},
        {from: './src/main/manifest.json', to: 'manifest.json'},
        {from: './src/main/discarded/discarded.html', to: 'discarded.html'},
        {from: './LICENSE', to: './LICENSE.txt'},
      ];

      if (!isProduction) {
        files.push({from: './src/main/background/.tmp/service.wasm', to: 'service.wasm.map'});
        files.push({from: './src/main/background/.tmp/service.wasm', to: 'service.wast'});
      }

      return files;
    })(), {}),
    new ZipFilesPlugin({
      entries: (() => {
        const files = [
          {dist: '/manifest.json', src: path.join(__dirname, `${getOutputPath()}manifest.json`)},
          {dist: '/service.wasm', src: path.join(__dirname, `${getOutputPath()}service.wasm`)},
          {dist: '/background.js', src: path.join(__dirname, `${getOutputPath()}background.js`)},
          {dist: '/discarded.html', src: path.join(__dirname, `${getOutputPath()}discarded.html`)},
          {dist: '/discarded.js', src: path.join(__dirname, `${getOutputPath()}discarded.js`)},
          {dist: '/options.html', src: path.join(__dirname, `${getOutputPath()}options.html`)},
          {dist: '/options.js', src: path.join(__dirname, `${getOutputPath()}options.js`)},
          {dist: '/options-styles.css', src: path.join(__dirname, `${getOutputPath()}options-styles.css`)},
          {dist: '/fox-16px.png', src: path.join(__dirname, `${getOutputPath()}fox-16px.png`)},
          {dist: '/fox-48px.png', src: path.join(__dirname, `${getOutputPath()}fox-48px.png`)},
          {dist: '/fox-96px.png', src: path.join(__dirname, `${getOutputPath()}fox-96px.png`)},
          {dist: '/LICENSE.txt', src: path.join(__dirname, `${getOutputPath()}LICENSE.txt`)},
        ];

        if (!isProduction) {
          files.push({dist: '/service.wasm.map', src: path.join(__dirname, `${getOutputPath()}service.wasm.map`)});
          files.push({dist: '/service.wast', src: path.join(__dirname, `${getOutputPath()}service.wast`)});
        }

        return files;
      })(),
      format: 'zip',
      output: path.join(__dirname, `${getOutputPath()}firefox-tab-suspender`),
    }),
  ],
  resolve: {
    alias: {
      '~': path.join(__dirname, 'src/'),
    },
    extensions: ['.js'],
  },
};
