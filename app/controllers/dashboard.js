import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DashboardController extends Controller {
  @tracked isProfileOpen = false;
  @tracked selectedChannelId = null;
  @tracked selectedUserId = null;
  @tracked messages = [];

  init() {
    super.init(...arguments);
    setTimeout(() => {
      if (this.model?.channels?.length > 0) {
        this.selectChannel(this.model.channels[0].id);
      }
    }, 1000);
  }

  @action
  async selectChannel(channelId) {
    this.selectedChannelId = channelId;
    this.selectedUserId = null; // Clear DM selection
    
    try {
      const response = await fetch(`/api/channels/${channelId}/messages`);
      const data = await response.json();
      this.messages = data.messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      this.messages = [];
    }
  }

  @action
  async selectUser(userId) {
    this.selectedUserId = userId;
    this.selectedChannelId = null; // Clear channel selection
    
    try {
      const response = await fetch(`/api/directmsgs/${userId}/messages`);
      const data = await response.json();
      this.messages = data.messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      this.messages = [];
    }
  }
} 