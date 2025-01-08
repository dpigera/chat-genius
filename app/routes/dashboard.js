import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DashboardRoute extends Route {
  @service store;
  @service pocketbase;

  async beforeModel() {
    try {
      await this.pocketbase.authSuperUser();
    } catch(e) {
      console.log(e);
    }
  }

  async model() {
    try {
      // Fetch channels + side load users
      const channels = await this.pocketbase.getChannels();
      const users = await this.pocketbase.getUsers();
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