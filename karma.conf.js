// Karma configuration
// Generated on Thu Jul 13 2017 11:01:30 GMT-0700 (PDT)
const fs = require("fs");

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine", "karma-typescript"],

    // list of files / patterns to load in the browser
    files: [
      "node_modules/regenerator-runtime/runtime.js",
      "packages/*/{src,test}/**/*.ts"
    ],

    // list of files to exclude
    exclude: ["packages/*/{src,test}/**/*.d.ts"],

    karmaTypescriptConfig: {
      coverageOptions: {
        threshold: {
          global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
            excludes: [
              'packages/*/test/**/*.ts'
            ]
          }
        }
      },
      reports: {
        "json": {
          "directory": "coverage",
          "filename": "coverage.json"
        },
        "html": "coverage"
      },
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        lib: ["dom", "es2017"],
        module: "commonjs", // ES not supported until experimental node12/nodenext moduleResolution
        target: "es2017",
        types: ["node", "jasmine"]
      },
      bundlerOptions: {
        transforms: [require("karma-typescript-es6-transform")()],
        exclude: ["@esri/arcgis-rest-types"],
        resolve: {
          // karmas resolver cant figure out the symlinked deps from lerna
          // so we need to manually alias each package here.
          alias: fs
            .readdirSync("packages")
            .filter(p => p[0] !== ".")
            .reduce((alias, p) => {
              alias[`@esri/solution-${p}`] = `packages/${p}/src/index.ts`;
              return alias;
            }, {})
        }
      }
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "packages/*/src/**/*.ts": ["karma-typescript", "coverage"],
      "packages/*/test/**/*.ts": ["karma-typescript"]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ["spec", "karma-typescript", "coverage"],
    reporters: ["dots", "karma-typescript", "coverage"],
    coverageReporter: {
      // specify a common output directory
      dir: 'coverage',
      reporters: [
        { type: 'lcov', subdir: 'lcov' }
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'Chrome', 'ChromeHeadless', 'ChromeHeadlessCI',
      'Edge',
      'Firefox'
    ],
    browserNoActivityTimeout: 120000,
    captureTimeout: 120000,
    browserDisconnectTimeout: 120000,
    plugins: [
      require('@chiragrupani/karma-chromium-edge-launcher'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('karma-firefox-launcher'),
      require('karma-jasmine'),
      require('karma-jasmine-diff-reporter'),
      require('karma-safari-launcher'),
      require('karma-spec-reporter'),
      require('karma-typescript'),
      require('karma-typescript-es6-transform')
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browsers should be started simultaneously
    concurrency: Infinity,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--headless', '--disable-translate', '--disable-extensions']
      }
    },
  });
};
