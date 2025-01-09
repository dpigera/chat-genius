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

  async setMyStatus(status) {
    try {
      const validStatuses = ['active', 'away', 'busy'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
      }
      const user = await this.client.collection('users').update(this.currentUser.id, {
        onlineStatus: status,
      });
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  }

  async authSuperUser() {
    let admin = await this.client.admins.authWithPassword('dpigera@gmail.com', '123password');
    return admin; 
  }

  async getMyChannels() {
    let channels = await this.client.collection('channels').getFullList({expand: 'users', sort: 'created'});
    channels = channels.filter(d => d.users.indexOf(this.currentUser.id) !== -1)
    return channels;
  }

  async getUsers() {
    const users = await this.client.collection('users').getFullList();
    return users;
  }

  async getMyDirectChannels() {
    let directChannels = await this.client.collection('directMessages').getFullList({
      expand: 'users',
      sort: 'created'
    });
    
    // step 1: filter all directChannels that don't contain current user
    directChannels = directChannels.filter(d => d.users.indexOf(this.currentUser.id) !== -1)
    
    // step 2: rename them
    directChannels.forEach(c => {
        if (c.users.length === 1) {
            c.name = c.expand.users[0].name
           
            c.onlineStatus = c.expand.users[0].onlineStatus;
            
        } else {
            let names = [];
            c.expand.users.forEach(u => {
                if (u.id !== this.currentUser.id) {
                    names.push(u.name);
                }
            });
            c.name = names.join(",");

            if (names.length === 1) {
                c.onlineStatus = c.expand.users.find(u => u.name === names[0]).onlineStatus;
            }
        }  
    });

    return directChannels;
  }

  async getUser(userId) {
    const user = await this.client.collection('users').getOne(userId);
    return user;
  }

  async getReplies(messageId) {
    const filter = `message="${messageId}"`;
    const replies = await this.client.collection('replies').getFullList({
      expand: 'user',
      filter,
      sort: 'created'
    });
    return replies;
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

  async getDirectMessages(directChannelId) {
    const filter = `directMessage="${directChannelId}"`; 
    const messages = await this.client.collection('messages').getFullList({
      expand: 'user',
      filter,
      sort: 'created',
    });
    return messages;
  }

  async createDirectChannel(userIds) {
    const data = {
      users: userIds
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

  async createChannel(data) {
    const record = await this.client.collection('channels').create({
      name: data.name,
      users: data.users
    });
    return record;
  }

  async getChannels() {
    const records = await this.client.collection('channels').getFullList();
    return records;
  }

}
