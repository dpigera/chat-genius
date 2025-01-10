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
      },
    },

    APP: {
    },
  };

  ENV['ember-cli-mirage'] = {
    enabled: false
  };

  if (environment === 'development') {
    ENV.APP.API_HOST = 'http://localhost:3000';
  }

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    ENV.APP.API_HOST = 'https://gauntlet-chatgenius-pocketbase-2.fly.dev';
  }

  return ENV;
};
