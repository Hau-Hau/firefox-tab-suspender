const webpack = require('webpack'),
      path = require('path'),
      glob = require('glob'),
      PurgecssPlugin = require('purgecss-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"),
      RemovePlugin = require('remove-files-webpack-plugin'),
      UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
      ZipPlugin = require('zip-webpack-plugin'),
      CopyWebpackPlugin = require('copy-webpack-plugin'),
      ConcatPlugin = require('webpack-concat-plugin'),
      isProd = (process.env.NODE_ENV == 'production');

function getOutputPath() {
  return isProd ? './dist/' : './dev/';
}

module.exports = {
  entry: {
    'options.js': './src/main/options/main.js',
    'options-styles': './src/main/options/styles/options-styles.scss'
  },
  output: {
    filename: function(chunkData) {
      return chunkData.chunk.name.indexOf('.js') !== -1 ? './[name]' : './[name].tmp';
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
          plugins: ['add-filehash']
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: { sourceMap: !isProd }
          }
        ]
      },
      {
        test: /\.(png|ico)$/,
        loader: ['file-loader?publicPath=./&name=[name].[ext]', 'image-webpack-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new PurgecssPlugin({
      paths: glob.sync(`src/main/options/*.html`),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      }
    }),
    new CopyWebpackPlugin([
      { from: './assets/fox-48px.png', to: 'fox-48px.png' },
      { from: './assets/fox-96px.png', to: 'fox-96px.png' },
      { from: './src/main/background/.tmp/service.wasm', to: 'service.wasm' },
      { from: './src/main/manifest.json', to: 'manifest.json' },
      { from: './src/main/options/index.html', to: 'options.html' },
      { from: './LICENSE', to: './LICENSE.txt' },
    ], {}),
    new RemovePlugin({
      before: {
        root: __dirname,
        include: [getOutputPath()]
      },
      after: {
        root: __dirname,
        test: [
          {
            folder: getOutputPath(),
            method: (filePath) => {
              return isProd ? new RegExp(/\.(?!(zip)$)([^.]+$)/, 'm').test(filePath) : new RegExp(/\.tmp$/, 'm').test(filePath);
            }
          }
        ]
      }
    }),
    new ConcatPlugin({
      uglify: isProd,
      sourceMap: !isProd,
      name: 'background',
      fileName: '[name].js',
      filesToConcat: ['./src/main/background/.tmp/service.js', './src/main/background/js/main.js'],
      attributes: {
          async: false
      }
    }),
    new ZipPlugin({
      filename: 'firefox-tab-suspender.zip',
      exclude: [/\.tmp$/]
    })
  ],
  optimization: {
    minimizer: isProd ? [
      new UglifyJsPlugin(),
      new OptimizeCSSAssetsPlugin({})
    ] : [],
  },
  node: {
    fs: 'empty'
  },
  resolve: {
    extensions: ['.js', '.json', '.html', '.wasm', '.css', 'scss']
  }
};
