import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DashboardRoute extends Route {
  @service store;

  async model() {
    try {
      // Fetch channels and DMs
      const [channelsResponse, directMessagesResponse] = await Promise.all([
        fetch('/api/channels'),
        fetch('/api/directmsgs')
      ]);

      const channels = await channelsResponse.json();
      const directMessages = await directMessagesResponse.json();

      // If we have channels, fetch messages for the first channel
      let messages = [];
      if (channels.channels.length > 0) {
        const firstChannel = channels.channels[0];
        const messagesResponse = await fetch(`/api/channels/${firstChannel.id}/messages`);
        messages = await messagesResponse.json();
      }

      return {
        channels: channels.channels,
        directMessages: directMessages.users,
        selectedChannelId: channels.channels[0]?.id,
        messages: messages.messages || []
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return {
        channels: [],
        directMessages: [],
        selectedChannelId: null,
        messages: []
      };
    }
  }
}