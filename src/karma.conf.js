// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular', 'jquery-3.2.1'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-jquery'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reporters: [
        { type: 'html', subdir: '.' },
        { type: 'lcovonly', subdir: '.' },
        { type: 'text-summary' }
      ],
      fixWebpackSourcePaths: true,
      check: {
        global: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
        ChromeHeadless: {
            base: 'Chrome',
            flags: [
                '--headless',
                '--disable-gpu',
                '--no-sandbox',
                '--remote-debugging-port=9222',
            ]
        }
    },
    browsers: ['ChromeHeadless'],
    singleRun: false
  });
};