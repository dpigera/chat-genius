import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DashboardRoute extends Route {
  @service store;
  @service pocketbase;

  async model() {
    try {
      // Super admin auth
      await this.pocketbase.client.admins.authWithPassword('dpigera@gmail.com', '123password');

      // Fetch channels + side load users
      const channels = await this.pocketbase.client.collection('channels').getFullList({expand: 'users'});
      const users = await this.pocketbase.client.collection('users').getFullList();
      return {
        channels: channels,
        directMessages: users,
        selectedChannelId: channels[0]?.id,
        messages: []
      };
    } catch(error) {
      return {
        channels: [],
        directMessages: [],
        selectedChannelId: null,
        messages: []
      };
    }
  }
}