const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const outputFileName = 'bundle';
const port = 4000;

const _dist = path.resolve(__dirname, 'dist');
const _src = path.resolve(__dirname, 'src/frontend');

let config = {
    context: path.resolve(__dirname, './'),

    entry: [ path.join(_src, 'index.ts') ],

    output: {
        path: _dist,
        filename: outputFileName + '.js',
        publicPath: '/dist/'
    },

    // webpack-dev-server config, see: https://webpack.github.io/docs/webpack-dev-server.html
    devServer: {
        contentBase: _dist,
        hot: true,
        inline: true,
        port: port
    },

    // http://webpack.github.io/docs/configuration.html#devtool
    devtool: '#eval-source-map',

    resolve: {
        extensions: ['.js', '.ts', '.json' ,'.vue'],
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },

    module: {
        loaders: [
            { test: /\.html$/, loader: 'html-loader' },
            { test: /\.pug$/, loader: 'pug-loader' },
            { test: /\.sass$/, loader:
                'style-loader?sourceMap=true!css-loader?sourceMap=true!sass-loader?indentedSyntax&sourceMap=true'
            },
            {
                test: /\.ts(x?)$/,
                loader: 'ts-loader',
                options: { appendTsSuffixTo: [ /\.vue$/ ] }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        sass: process.env.NODE_ENV === 'production'?
                            'vue-style-loader!css-loader!sass-loader?indentedSyntax':
                            'vue-style-loader?sourceMap=true!css-loader?sourceMap=true!sass-loader?indentedSyntax&sourceMap=true'
                    }
                }
            }
        ]
    },

    plugins: [
        // HMR issue, see: https://github.com/webpack/webpack/issues/1151
        // new webpack.HotModuleReplacementPlugin(),

        new htmlWebpackPlugin({
            filename: path.join(_dist, 'index.html'),
            template: path.join(_src, 'index.html'),
            favicon: path.join(_src, 'static' , 'favicon.ico'),
            inject: true,
        }),
    ]

}

// When use in production (npm run build)
if (process.env.NODE_ENV === 'production') {

    // You may want to use different name for production
    // config.output.filename = outputFileName + '.min.js'
    
    // still need babel for production stage since uglifyJs not support es6
    config.module.loaders = (config.module.loaders || []).concat([
        { test: /\.ts(x?)$/, loader: 'babel-loader?presets[]=es2015!ts-loader' },
        { test: /\.js$/, loader: 'babel-loader', query: { presets: ['es2015'] } }
    ])

    config.devtool = '#source-map'

    // https://vuejs.org/guide/deployment.html
    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"production"'
        }
        }),
        new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
        }),
        new webpack.optimize.OccurrenceOrderPlugin()
    ])

} else {

    config.module.loaders = config.module.loaders.concat([
        { test: /\.ts(x?)$/, loader: 'ts-loader' }
    ])

}


module.exports = config
