const {
	resolve
} = require('path');

const Clean = require('clean-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const commonConfig = {

	entry: {
		app: './js/app/init.jsx',
		vendor: [
			'jquery', 'jquery-ui-bundle', 'jquery-contextmenu',
			'font-awesome-webpack',
			'idle-js',
			'react', 'react-dom', 'react-simple-colorpicker',
			'moment',
			'pako'
		]
	},
	output: {
		filename: 'spacedew_finale.js',
		// the output bundle

		path: resolve(__dirname, 'dist'),

		publicPath: '/'
		// necessary for HMR to know where to load the hot update chunks
	},

	// devtool: 'inline-source-map',
	devtool: 'source-map',

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
				loader: 'babel-loader',
				exclude: [
					resolve(__dirname, "node_modules")
				],
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

		new webpack.HotModuleReplacementPlugin(),
		// enable HMR globally

		new webpack.NamedModulesPlugin(),
		// prints more readable module names in the browser console on HMR updates

		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			filename: 'vendor-[hash].js',
			minChunks: Infinity
		}),

		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
		}),

		new CopyWebpackPlugin([{
				from: './html',
				to: 'html'
			},
			{
				from: './js/public',
				to: 'js/public'
			},
			{
				from: './public',
				to: 'public'
			}
		]),

		new ExtractTextPlugin("wup.css"),
	]
}

const devConfig = Object.assign({}, commonConfig);

const devHtmlPlugin = new HtmlWebpackPlugin({
	template: 'index_template.ejs',
	title: "Reckless Abandon (Dev)",
	hash: true,
	favicon: './public/favicon-normal.png'
});

devConfig.plugins.push(devHtmlPlugin);

const prodConfig = Object.assign({}, commonConfig);

const prodHtmlPlugin = new HtmlWebpackPlugin({
	template: 'index_template.ejs',
	title: "Reckless Abandon",
	hash: true,
	favicon: './public/favicon-normal.png'
});

const prodUglifyJsPlugin = new UglifyJSPlugin({
	uglifyOptions: {
		ecma: 8,
		output: {
			comments: false,
			beautify: false,
		},
		mangle: false,
		compress: false,
		warnings: true
	}
});

const setProductionEnv = new webpack.DefinePlugin({
	'process.env': {
		// This has effect on the react lib size
		'NODE_ENV': JSON.stringify('production'),
	}
});

prodConfig.plugins.unshift(setProductionEnv);
prodConfig.plugins.push(prodHtmlPlugin);
prodConfig.plugins.unshift(prodUglifyJsPlugin);

if (process.env.NODE_ENV && process.env.NODE_ENV.trim() == 'webpack_prod_build') {
	console.log("Using prod config.");
	module.exports = prodConfig;
} else {
	console.log("Using dev config.");
	module.exports = devConfig;
}