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

  async authSuperUser() {
    const admin = await this.pocketbase.client.admins.authWithPassword('dpigera@gmail.com', '123password');
    return admin;
  }

  async getChannels() {
    const channels = await this.client.collection('channels').getFullList({expand: 'users'});
    return channels;
  }

  async getUsers() {
    await this.authSuperUser
    const users = await this.client.collection('users').getFullList();
    return users;
  }

  async getChannelMessages(channelId) {
    const filter = `channel="${channelId}"`; 
    const messages = await this.client.collection('messages').getFullList({
      expand: 'user',
      filter,
      sort: 'created',
    });
    return messages;
  }

  async getDirectMessages(directMessageId) {
    const filter = `directMessage="${directMessageId}"`; 
    const messages = await this.client.collection('directMessages').getFullList({
      expand: 'user',
      filter,
      sort: 'created',
    });
    return messages;
  }

  async login({email, password}) {
    const authData = await this.client.collection('users').authWithPassword(email, password);
    this.currentUser = authData.record;
    return {
        access_token: authData.token,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: null,
        user: authData.record
    }
  }

  async register({ email, password, passwordConfirm, firstName, lastName }) {
    try {
      const name = `${firstName} ${lastName}`;
      const verified = true;
      const userData = {
        email,
        password,
        passwordConfirm,
        name,
        verified
      };

      const record = await this.client.collection('users').create(userData);
      return record;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
}
