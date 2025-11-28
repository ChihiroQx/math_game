const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|mp3|ogg|wav)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: '数学童话冒险'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'assets', 
          to: 'assets', 
          noErrorOnMissing: true,
          // 排除非图集资源（只保留图集文件夹）
          globOptions: {
            ignore: [
              // 排除原始序列帧文件夹
              '**/res/player/**',
              '**/res/monster/**',
              '**/res/effect/**',
              // 保留图集文件夹
              // '**/res/player_atlas/**',  // 保留
              // '**/res/monster_atlas/**', // 保留
              // '**/res/effect_atlas/**'   // 保留
            ]
          }
        }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 8080,
    hot: true
  }
};
