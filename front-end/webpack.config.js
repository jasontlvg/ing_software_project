const webpack= require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer= require('autoprefixer');
const CleanWebpackPlugin= require('clean-webpack-plugin');
module.exports = {
    // devtool: "source-map",
    entry: './src/index.js',
    output: {
        path: __dirname+'/dist/',
        // publicPath: '/dist/',
        filename: 'main.bundle.js',
        // publicPath: "/dist/"
    },
    devServer:{
        contentBase: __dirname+'/dist/',
        compress: true,
        port: 9000,
        disableHostCheck: true,
        open: 'google-chrome'
    },
    // devtool: 'source-map',
    module: {
        rules: [
            { // Loader
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            { // Loader
                test: /\.(css|scss)$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    {loader: MiniCssExtractPlugin.loader},
                    "css-loader", // translates CSS into CommonJS
                    {
                        loader: 'postcss-loader',
                        options: {
                          ident: 'postcss',
                          plugins: [
                            autoprefixer({browsers: 'last 2 versions'}),
                          ]
                        }
                    },
                    "resolve-url-loader",
                    "sass-loader?outputStyle=compressed" // compiles Sass to CSS, using Node Sass by default 'compressed&sourceMap'
                ]
            },
            
            { // Loader
                test: /\.(jpe?g|png|gif|svg|webp)$/i,
                use:[
                    "file-loader?name=img/[name].[ext]", 
                    "image-webpack-loader?bypassOnDebug"
                ]
            },
            { // Loader
                test: /\.(ttf|eot|woff2?|mp4|mp3|txt|xml|pdf)$/i,
                use:"file-loader?name=assets/[name].[ext]"
            },
            { // Loader
                test: /\.pug$/, 
                loader: "pug-loader", 
                query: { pretty: true }
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin({}),
        new HtmlWebpackPlugin({template: './src/index.pug', minify: false}),
        new MiniCssExtractPlugin({filename: "css/[name].css", chunkFilename: "[id].css" }) // Borra el 'css/' si quieres que se guarde en la raiz de 
    ]
};