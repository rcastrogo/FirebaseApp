const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, options) => {

  const isDevelopment = options.mode !== 'production'

  return {
    watch: isDevelopment ? true : false,
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'inline-source-map' : undefined,
    entry: './src/index.js',
    output: {
      filename: isDevelopment ? '[name].js' : '[name].[hash].js',
      path: path.resolve(__dirname, 'public')
    },
    devServer: {
      port: 8081,
      contentBase: path.join(__dirname, 'public'),
      historyApiFallback: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        hash: false,
        template: './src/index.html',
        templateParameters: {
          title   : 'Firebase App',
          baseHref : isDevelopment ? '/' : '/',
        }
      }),
      new HtmlWebpackPlugin({
        hash: false,
        filename: '404.html',
        template: './src/index.html',
        templateParameters: {
          title   : 'Firebase App',
          baseHref : '//',
        }
      })
    ],
    module: {
      rules: [
        {
          test: /\.template$/i,
          use: ['html-loader'],
        },
      ],
    },
    resolveLoader: {
      modules: ['node_modules', path.resolve(__dirname, './src/loaders')]
    }
  };
}
;


