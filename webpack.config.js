var path = require('path');

module.exports = {
  entry: './app/index.js',
  //entry: ["babel-polyfill",'./app/index.js'],
  output: {
    filename: 'bundle.jsfl',
    path: path.resolve(__dirname, 'dist')
  },
  watch: true,
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: [
          'es2015'
        ],
        plugins: []
      },
      include: [
        path.resolve(__dirname, 'app')
      ]
    }]
  }
};