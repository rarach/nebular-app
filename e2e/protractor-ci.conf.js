//Protractor config; special version for Travis CI to run browser in headless mode

const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
    args: ['--headless', '--no-sandbox', "--proxy-server='direct://'", "--proxy-bypass-list=*"]
  }
};

exports.config = config;
