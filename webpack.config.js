const webpack = require('webpack'),
      path = require('path'),
      RemovePlugin = require('remove-files-webpack-plugin'),
      UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
      ZipPlugin = require('zip-webpack-plugin'),
      CopyWebpackPlugin = require('copy-webpack-plugin'),
      isProd = (process.env.NODE_ENV == 'production');

function getOutputPath() {
  return isProd ? './dist/' : './dev/';
}

module.exports = {
  entry: {
    'service.js': './src/background/main.js',
    'options.js': './src/options/scripts/main.js',
    'styles': ['./src/options/styles/options-styles.scss']
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
            {
              loader: 'file-loader',
              options: {
                  name: '[name].css',
                  context: './',
                  publicPath: '/'
                }
            },
            { loader: 'extract-loader' },
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
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      }
    }),
    new CopyWebpackPlugin([
      { from: './src/manifest.json', to: 'manifest.json' },
      { from: './src/options/index.html', to: 'options.html' }
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
    new ZipPlugin({
      filename: 'firefox-tab-suspender.zip',
      exclude: [/\.tmp$/],
    })
  ],
  optimization: {
    minimizer: isProd ? [
      new UglifyJsPlugin()
    ] : []
  },
  resolve: {
    extensions: ['.js', '.json', '.html']
  }
};
