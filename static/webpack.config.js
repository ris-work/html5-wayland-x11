import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlInlineScriptPlugin from 'html-inline-script-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'; // Add this
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  mode: 'production',
  entry: {
    vncrtckeepalive: './vncrtckeepalive.html',
    vnc: './vnc.html',
    vnc_lite: './vnc_lite.html',
    vncrtcheavy: './vncrtcheavy.html'
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: {
                list: [
                  {
                    tag: 'img',
                    attribute: 'src',
                    type: 'src',
                  },
                  {
                    tag: 'script',
                    attribute: 'src',
                    type: 'src',
                  },
                  {
                    tag: 'link',
                    attribute: 'href',
                    type: 'src',
                    filter: (tag, attribute, attributes) => {
                      return attributes.rel === 'stylesheet';
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.js$/i,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag'
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/i,
        type: 'asset/inline'
      }
    ]
  },
  optimization: {
    minimizer: [
      '...', // This extends existing minimizers (like Terser for JS)
      new CssMinimizerPlugin(), // Add CSS minification
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './vncrtckeepalive.html',
      filename: 'vncrtckeepalive.min.html',
      inject: false,
      chunks: ['vncrtckeepalive']
    }),
    new HtmlWebpackPlugin({
      template: './vnc.html',
      filename: 'vnc.min.html',
      inject: false,
      chunks: ['vnc']
    }),
    new HtmlWebpackPlugin({
      template: './vnc_lite.html',
      filename: 'vnc_lite.min.html',
      inject: false,
      chunks: ['vnc_lite']
    }),
    new HtmlWebpackPlugin({
      template: './vncrtcheavy.html',
      filename: 'vncrtcheavy.min.html',
      inject: false,
      chunks: ['vncrtcheavy']
    }),
    new HtmlInlineScriptPlugin()
  ],
  resolve: {
    extensions: ['.js', '.css', '.html']
  }
};
