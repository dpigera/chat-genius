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
    let admin = await this.client.admins.authWithPassword('dpigera@gmail.com', '123password');
    return admin; 
  }

  async getChannels() {
    const channels = await this.client.collection('channels').getFullList({expand: 'users'});
    return channels;
  }

  async getUsers() {
    const users = await this.client.collection('users').getFullList();
    return users;
  }

  async getUser(userId) {
    const user = await this.client.collection('users').getOne(userId);
    return user;
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

  async getDirectChannel(userId) {
    const currentUserId = this.currentUser.id;
    const filter = `users ~ '${userId}' && users ~ '${currentUserId}'`;
    const directChannels = await this.client.collection('directMessages').getFullList({
      filter,
    });
    return directChannels;
  }

  async getDirectMessages(directChannelId) {
    const filter = `directMessage="${directChannelId}"`; 
    const messages = await this.client.collection('messages').getFullList({
      expand: 'user',
      filter,
      sort: 'created',
    });
    return messages;
  }

  async createDirectChannel(userId) {
    const data = {
      users: [this.currentUser.id, userId]
    };
    
    const record = await this.client.collection('directMessages').create(data);
    return record;
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
