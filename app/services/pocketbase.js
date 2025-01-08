import Service from '@ember/service';
import PocketBase from 'pocketbase';
import { tracked } from '@glimmer/tracking';
// import { inject as service } from '@ember/service';
// import config from '../config/environment';

export default class PocketbaseService extends Service {
  @tracked currentUser = null;

  constructor() {
    super(...arguments);
    this.client = new PocketBase('http://127.0.0.1:8090');
  }

  get name() {
    return this.currentUser?.name;
  }

  async register({ email, password, passwordConfirm, firstName, lastName }) {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        firstName,
        lastName
      };

      const record = await this.client.collection('users').create(userData);
      
      // Auto login after registration
      await this.login(email, password);
      
      return record;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
}
