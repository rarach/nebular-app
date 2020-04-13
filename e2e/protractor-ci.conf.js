//Protractor config; special version for Travis CI to run browser in headless mode

const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
  args: ['--headless', '--no-sandbox', "--proxy-server='direct://'", "--proxy-bypass-list=*" /*For local debugging , "--remote-debugging-port=9222"*/]
  }
};
//NOTE: this needs to be updated with each new chrome/chromedriver/Travis_distro
config.chromeDriver = '../node_modules/webdriver-manager/selenium/chromedriver_81.0.4044.69',

exports.config = config;
