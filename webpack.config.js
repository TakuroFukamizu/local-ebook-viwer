const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const BabiliPlugin = require("babili-webpack-plugin");
const outputFileName = 'bundle';

const _dist = path.resolve(__dirname, 'dist/client');
const _src = path.resolve(__dirname, 'src/frontend');

process.env.PORT = process.env.PORT || '';
process.env.FE_PORT = process.env.FE_PORT || 4000;

let config = {
    context: path.resolve(__dirname, './'),

    entry: {
        "index": path.join(_src, 'index.ts')
    },

    output: {
        path: _dist,
        filename: '[name].' + outputFileName + '.js',
        publicPath: '/static/'
    },

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
            { test: /\.css$/, loader:
                'style-loader?sourceMap=true!css-loader?sourceMap=true'
            },
            { test: /\.sass$/, loader:
                'style-loader?sourceMap=true!css-loader?sourceMap=true!sass-loader?indentedSyntax&sourceMap=true'
            },
            { test: /\.scss$/, loader: 'scss-loader' },
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
            },
            { test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/, loader: "file-loader" },
            { test: /\.(jp(e?)g|png|gif|svg)$/, loaders: 'file-loader?name=resources/img/[name].[ext]' }
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

        new webpack.EnvironmentPlugin([
            'NODE_ENV',
            'PORT'
        ])
    ]

}

// When use in production (npm run build)
if (process.env.NODE_ENV === 'production') {
    /**
     * https://vuejs.org/guide/deployment.html
     */
    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        // new webpack.optimize.UglifyJsPlugin({
        //     sourceMap: false,
        //     mangle: {
        //         // Vue Componentが動かなくなる対策
        //         keep_fnames: true
        //     },
        //     ecma: 8,
        //     compress: {
        //         warnings: false
        //     }
        // })
        new BabiliPlugin({}, {
            sourceMap: false
        })
    ]);
} else {
    config.devtool = '#eval-source-map';
    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"development"'
            }
        }),
    ]);

    /**
     * webpack-dev-server config
     * see: https://webpack.github.io/docs/webpack-dev-server.html
     */

    // webpack-dev-server config, see: https://webpack.github.io/docs/webpack-dev-server.html
    config.devServer = {
        contentBase: _dist,
        hot: true,
        inline: true,
        port: process.env.FE_PORT,
    };
}


module.exports = config
