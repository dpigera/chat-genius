import {
  discoverEmberDataModels,
  // applyEmberDataSerializers,
} from 'ember-cli-mirage';
import { createServer } from 'miragejs';

export default function (config) {
  let finalConfig = {
    ...config,
    // Remove discoverEmberDataModels if you do not want ember-cli-mirage to auto discover the ember models
    models: {
      ...discoverEmberDataModels(config.store),
      ...config.models
    },
    // uncomment to opt into ember-cli-mirage to auto discover ember serializers
    // serializers: applyEmberDataSerializers(config.serializers),
    routes,
  };

  return createServer(finalConfig);
}

function routes() {
  // Authentication endpoint
  this.post('/auth/token', (schema, request) => {
    let attrs = JSON.parse(request.requestBody);
    
    // Valid credentials check
    if (attrs.email === 'user@gauntlet.ai' && attrs.password === 'In23949dfskdsfske') {
      return {
        access_token: 'valid.mock.token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'valid.refresh.token'
      };
    } else {
      // Invalid credentials response
      return new Response(401, 
        { 'Content-Type': 'application/json' },
        { 
          errors: [{
            status: '401',
            title: 'Invalid credentials',
            detail: 'The email or password you entered is incorrect.'
          }]
        }
      );
    }
  });

  // Allow other endpoints to pass through
  this.passthrough();
}
