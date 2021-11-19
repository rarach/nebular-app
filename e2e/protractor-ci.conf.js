//Protractor config; special version for CI pipeline to run browser in headless mode

const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
  args: ['--headless', '--no-sandbox', "--proxy-server='direct://'", "--proxy-bypass-list=*" /*For local debugging , "--remote-debugging-port=9222"*/]
  }
};

exports.config = config;
