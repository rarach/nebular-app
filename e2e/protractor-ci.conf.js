//Protractor config; special version for CI pipeline to run browser in headless mode

const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
  args: ['--headless', '--no-sandbox', "--proxy-server='direct://'", "--proxy-bypass-list=*" /*For local debugging , "--remote-debugging-port=9222"*/]
  }
};
//NOTE: Unfortunate Protractor nuts! This needs to be updated with each new chrome/chromedriver
//DEL? config.chromeDriver = '../node_modules/webdriver-manager/selenium/chromedriver_89.0.4389.23',

exports.config = config;
