const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const baseConfig = require('./base.config.js');
const { getHtmlMetaTags, projectRoot } = require('./helpers');

const { productName } = require('../package.json');

const htmlWebPackPluginConfiguration = {
  meta: getHtmlMetaTags(),
  template: path.resolve(projectRoot, 'index.html'),
  title: productName,
};

const plugins = [
  // Create index.html on-the-fly
  new HtmlWebpackPlugin(htmlWebPackPluginConfiguration),
];

/* In dev mode, also run Electron and let it load the live bundle */
if (process.env.NODE_ENV !== 'production' && process.env.DEPLOYMENT !== '1') {
  plugins.push(
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ['electron launcher.js'],
        blocking: false,
        dev: true,
        parallel: true,
      },
    })
  );
}

module.exports = merge(baseConfig, {
  // @babel/polyfill not needed here, it is loaded by the preloader script.
  // Loading it would mean that the polyfill ends up being loaded twice (once
  // by the preloader, once here)
  entry: {
    app: ['@babel/polyfill', 'process/browser', './src/index'],
  },
  plugins,
});
