const webpack = require('webpack'),
  path = require('path'),
  glob = require('glob'),
  PurgecssPlugin = require('purgecss-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
  WebpackShellPlugin = require('webpack-shell-plugin-next'),
  ZipFilesPlugin = require('webpack-zip-files-plugin'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  isProd = (process.env.NODE_ENV == 'production');

function getOutputPath() {
  return isProd ? './dist/' : './dev/';
}

module.exports = {
  entry: {
    'options.js': './src/main/options/main.js',
    'discarded.js': './src/main/discarded/main.js',
    'background.js': './src/main/background/.tmp/background.js',
    'options-styles': './src/main/options/styles/options-styles.scss',
  },
  output: {
    filename: function(chunkData) {
      return chunkData.chunk.name.indexOf('.js') !== -1
        ? './[name]'
        : './[name].tmp';
    },
    path: path.resolve(__dirname, getOutputPath()),
    publicPath: '/',
  },
  devtool: isProd ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['add-filehash'],
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader'},
          {
            loader: 'sass-loader',
            options: {sourceMap: !isProd},
          },
        ],
      },
      {
        test: /\.(png|ico)$/,
        loader: [
          'file-loader?publicPath=./&name=[name].[ext]',
          'image-webpack-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new PurgecssPlugin({
      paths: glob.sync(`src/main/**/*.html`),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
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
    new CopyWebpackPlugin([
      {from: './assets/fox-16px.png', to: 'fox-16px.png'},
      {from: './assets/fox-48px.png', to: 'fox-48px.png'},
      {from: './assets/fox-96px.png', to: 'fox-96px.png'},
      {from: './src/main/background/.tmp/service.wasm', to: 'service.wasm'},
      {from: './src/main/manifest.json', to: 'manifest.json'},
      {from: './src/main/discarded/discarded.html', to: 'discarded.html'},
      {from: './LICENSE', to: './LICENSE.txt'},
    ], {}),
    new ZipFilesPlugin({
      entries: [
        { src: path.join(__dirname, `${getOutputPath()}manifest.json`), dist: '/manifest.json' },
        { src: path.join(__dirname, `${getOutputPath()}service.wasm`), dist: '/service.wasm' },
        { src: path.join(__dirname, `${getOutputPath()}background.js`), dist: '/background.js' },
        { src: path.join(__dirname, `${getOutputPath()}discarded.html`), dist: '/discarded.html' },
        { src: path.join(__dirname, `${getOutputPath()}discarded.js`), dist: '/discarded.js' },
        { src: path.join(__dirname, `${getOutputPath()}options.html`), dist: '/options.html' },
        { src: path.join(__dirname, `${getOutputPath()}options.js`), dist: '/options.js' },
        { src: path.join(__dirname, `${getOutputPath()}options-styles.css`), dist: '/options-styles.css' },
        { src: path.join(__dirname, `${getOutputPath()}fox-16px.png`), dist: '/fox-16px.png' },
        { src: path.join(__dirname, `${getOutputPath()}fox-48px.png`), dist: '/fox-48px.png' },
        { src: path.join(__dirname, `${getOutputPath()}fox-96px.png`), dist: '/fox-96px.png' },
        { src: path.join(__dirname, `${getOutputPath()}LICENSE.txt`), dist: '/LICENSE.txt' },
      ],
      output: path.join(__dirname, `${getOutputPath()}firefox-tab-suspender`),
      format: 'zip',
    }),
  ],
  optimization: {
    minimizer: isProd ? [
      new UglifyJsPlugin({
        uglifyOptions: {
          warnings: false,
          parse: {},
          compress: {},
          mangle: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_fnames: true,
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ] : [],
  },
  node: {
    fs: 'empty',
  },
  resolve: {
    extensions: ['.js', '.json', '.html', '.wasm', '.css', 'scss'],
  },
};
