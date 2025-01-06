import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';

export default class JWTAuthenticator extends Base {
  @service session;

  async authenticate(credentials) {
    try {
      const response = await fetch('/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response._bodyText?.includes('access_token')) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Invalid credentials');
      }

      /*
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Invalid credentials');
      }
      */

      const data = await response.json();
      return {
        ...data,
        // Store additional session data if needed
        authenticatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(error.message || 'Authentication failed');
    }
  }

  restore(data) {
    // Check if we have valid session data
    if (data && data.access_token) {
      return Promise.resolve(data);
    }
    return Promise.reject();
  }

  invalidate() {
    // Handle logout - for now, just resolve the promise
    return Promise.resolve();
  }
}