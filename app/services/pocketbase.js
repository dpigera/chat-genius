import Service from '@ember/service';
import PocketBase from 'pocketbase';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import config from '../config/environment';

export default class PocketbaseService extends Service {
  @tracked currentUser = null;

  constructor() {
    super(...arguments);
    this.client = new PocketBase(config.APP.API_HOST);
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

  async getMessage(messageId) {
    const message = await this.client.collection('messages').getOne(messageId, {
      expand: 'user,reactions'
    });
    return message; 
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
      expand: 'user,reactions',
      filter,
      sort: 'created',
    });
    return messages;
  }

  async getDirectMessages(directChannelId) {
    const filter = `directMessage="${directChannelId}"`; 
    const messages = await this.client.collection('messages').getFullList({
      expand: 'user,reactions',
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

  async searchUsers(query) {
    if (!query || query.length < 2) return [];
    
    try {
      const users = await this.client.collection('users').getList(1, 10, {
        filter: `name ~ "${query}"`,
        sort: '-created'
      });
      return users.items;
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  async searchMessages(query) {
    if (!query || query.length < 2) return [];
    
    try {
      const messages = await this.client.collection('messages').getList(1, 10, {
        filter: `body ~ "${query}"`,
        expand: 'user',
        sort: '-created'
      });
      return messages.items;
    } catch (error) {
      console.error('Failed to search messages:', error);
      return [];
    }
  }

  async uploadFile(file) {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file directly to the messages collection
      const result = await this.client.collection('messages').create(formData);

      return result.url;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async createMessage(data) {
    try {
      let fileUrl = null;
      let fileName = null;

      if (data.file) {
        // Create form data with both file and message data
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('body', data.body);
        formData.append('user', this.currentUser.id);
        
        if (data.channelId) {
          formData.append('channel', data.channelId);
        }
        if (data.directMessageId) {
          formData.append('directMessage', data.directMessageId);
        }

        const record = await this.client.collection('messages').create(formData);
        return record;
      } else {
        // No file, just create regular message
        const messageData = {
          body: data.body,
          user: this.currentUser.id,
          channel: data.channelId,
          directMessage: data.directMessageId
        };

        const record = await this.client.collection('messages').create(messageData);
        return record;
      }
    } catch (error) {
      console.error('Failed to create message:', error);
      throw error;
    }
  }
}
