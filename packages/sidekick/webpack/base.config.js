// Use strict mode so we can have block-scoped declarations
'use strict';

// Don't use let in the line below because older Node.js versions on Linux
// will not like it
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const GitRevisionPlugin = require('git-revision-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const { outputDir, projectRoot } = require('./helpers');

const enableSourceMap = process.env.NODE_ENV !== 'production';

const gitRevisionPlugin = new GitRevisionPlugin();

module.exports = {
  mode: 'development',

  output: {
    path: outputDir,
    filename: '[name].bundle.js',
  },

  devtool: enableSourceMap ? 'cheap-module-source-map' : undefined,

  devServer: {
    hot: true,
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    // The next module is needed for golden-layout to work nicely
    new webpack.ProvidePlugin({
      ReactDOM: 'react-dom',
      React: 'react',
    }),

    // Resolve process.env in the code
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEPLOYMENT: '0',
    }),

    // Resolve the git version number and commit hash in the code
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(gitRevisionPlugin.version()),
      COMMIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
    }),

    // Add environment variables from .env
    new Dotenv(),

    // Add VERSION and COMMITHASH file to output
    gitRevisionPlugin,
  ],
  resolve: {
    alias: {
      '~': path.resolve(projectRoot, 'src'),
      config: path.resolve(projectRoot, 'config', 'default'),
    },
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.join(
                projectRoot,
                '..',
                '..',
                'babel.config.json'
              ),
            },
          },
        ],
        include: [
          path.join(projectRoot, 'config'),
          path.join(projectRoot, 'src'),
          path.join(projectRoot, '..', 'mui-components', 'src'),
        ],
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' },
        ],
        include: path.join(projectRoot, 'assets', 'css'),
      },
      {
        test: /\.(png|jpg|skyc)$/,
        type: 'asset/resource',
        include: path.join(projectRoot, 'assets'),
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg|mp3|wav|ogg|gltf|obj)$/,
        type: 'asset/resource',
      },
    ],
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        /* Extract license comments to a separate file */
        extractComments: /^@preserve|license|cc-/i,

        /* Drop console.log() calls in production */
        terserOptions: {
          compress: {
            // eslint-disable-next-line camelcase
            drop_console: true,
          },
          output: {
            // This is needed because otherwise Terser will happily replace
            // escape sequences in string literals with their Unicode
            // equivalents, which makes Electron blow up when starting the app,
            // at least on macOS. Electron will start reading the file as ASCII,
            // not UTF-8, and it will ultimately crash because lodash/deburr
            // contains fancy accented characters as keys in an object, and
            // the UTF-8 representations of these accented characters get parsed
            // as ASCII, leading to invalid JS code.
            //
            // eslint-disable-next-line camelcase
            ascii_only: true,
          },
        },
      }),
    ],
  },

  /* No need for bundle size warnings */
  performance: { hints: false },
};
