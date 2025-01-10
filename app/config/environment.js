'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'your-app-name',
    environment,
    rootURL: '/',
    locationType: 'history',
    
    pocketbase: {
      url: environment === 'production' 
        ? 'https://gauntlet-chatgenius-pocketbase-2.fly.dev'
        : 'http://127.0.0.1:8090'
    },
    
    // ... other config
  };

  return ENV;
}; 