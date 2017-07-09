const {
  resolve
} = require('path');

const Clean = require('clean-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  // context: resolve(__dirname, 'client'),

  entry: [
    'react-hot-loader/patch',
    // activate HMR for React

    'webpack-dev-server/client?http://localhost:8080',
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint

    'webpack/hot/only-dev-server',
    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates

    './js/app/init.js'
    // the entry point of our app
  ],
  output: {
    filename: 'spacedew_finale.js',
    // the output bundle

    path: resolve(__dirname, 'dist'),

    publicPath: '/'
    // necessary for HMR to know where to load the hot update chunks
  },

  // TODO - configure environments
  // devtool: 'inline-source-map',
  // devtool: 'source-map',

  devServer: {
    hot: true,
    // enable HMR on the server

    contentBase: resolve(__dirname, 'dist'),
    // match the output path

    publicPath: '/'
    // match the output `publicPath`
  },

  module: {
    rules: [{
        test: /\.jsx/,
        loader: 'babel-loader'
      }, {
        test: /\.(png|jpg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      },
      {
        test: /\.(less|css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader',
            {
              loader: 'less-loader',
              options: {
                noIeCompat: true
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new Clean(['dist']),

    new webpack.DefinePlugin({
      'process.env': {
        // This has effect on the react lib size
        'NODE_ENV': JSON.stringify('production'),
      }
    }),

    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally

    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates

    new CopyWebpackPlugin([{
        from: './html',
        to: 'html'
      },
      {
        from: './js/public',
        to: 'js/public'
      }
    ]),

    new ExtractTextPlugin("wup.css"),

    new HtmlWebpackPlugin({
      title: "Spacedew Finale",
      hash: true,
      favicon: './images/favicon-normal.png'
      // template: 'client/index.html',
      // hash: true
    })
  ]
};