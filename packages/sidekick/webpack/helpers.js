const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.resolve(projectRoot, 'build');

const { productName } = require('../package.json');

const getHtmlMetaTags = ({ disableCSP } = {}) => {
  const result = {
    charset: 'utf-8',
    description: productName,
    viewport:
      'initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no',
    'X-UA-Compatible': 'IE=edge',
  };

  if (!disableCSP) {
    result['Content-Security-Policy'] =
      "script-src 'self'; connect-src * ws: wss:;";
  }

  return result;
};

module.exports = {
  getHtmlMetaTags,
  projectRoot,
  outputDir,
};
