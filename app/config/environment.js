'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'chat-genius',
    environment,
    rootURL: '/',
    locationType: 'history',
    
    pocketbase: {
      url: environment === 'production' 
        ? 'https://gauntlet-chatgenius-pocketbase-2.fly.dev'
        : 'http://127.0.0.1:8090'
    }
  };

  if (environment === 'production') {
    // Add any production-specific settings
    ENV.rootURL = '/';
    ENV.locationType = 'history';
  }

  return ENV;
}; 