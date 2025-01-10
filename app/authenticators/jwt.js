import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';

export default class JWTAuthenticator extends Base {
  @service session;
  @service pocketbase;

  async authenticate(credentials) {
    try {
      const authData = await this.pocketbase.login({email: credentials.email, password: credentials.password});
      return authData
    }catch(error) {
      throw new Error(error.message || 'Authentication failed');
    }
  }

  restore(data) {
    // Check if we have valid session data
    if (data && data.access_token) {
      this.pocketbase.currentUser = data.user;
      return Promise.resolve(data);
    }
    return Promise.reject();
  }

  invalidate() {
    this.pocketbase.currentUser = null;
    return Promise.resolve();
  }
}