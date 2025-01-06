'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'player-basic',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  ENV['ember-cli-mirage'] = {
    enabled: true
  };

  if (environment === 'development') {
    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    
  }

  

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
  }

  if (environment === 'production') {
    ENV.APP.API_HOST = 'https://apple-server.fly.dev';
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
  }

  return ENV;
};
