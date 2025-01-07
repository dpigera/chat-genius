import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DashboardController extends Controller {
  @tracked isProfileOpen = false;
  @tracked selectedChannelId = null;
  @tracked selectedUserId = null;
  @tracked messages = [];
  @tracked isThreadVisible = false;
  @tracked selectedMessage = null;
  @tracked replies = [];
  @tracked isLoadingReplies = false;

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
    this.selectedUserId = null;
    this.isThreadVisible = false; // Hide thread when changing channels
    
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
    this.selectedChannelId = null;
    this.isThreadVisible = false; // Hide thread when changing DMs
    
    try {
      const response = await fetch(`/api/directmsgs/${userId}/messages`);
      const data = await response.json();
      this.messages = data.messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      this.messages = [];
    }
  }

  @action
  async showThread(message) {
    this.selectedMessage = message;
    this.isThreadVisible = true;
    this.isLoadingReplies = true;
    
    try {
      const response = await fetch(`/api/messages/${message.id}/replies`);
      const data = await response.json();
      this.replies = data.replies;
    } catch (error) {
      console.error('Error loading replies:', error);
      this.replies = [];
    } finally {
      this.isLoadingReplies = false;
    }
  }

  @action
  closeThread() {
    this.isThreadVisible = false;
    this.selectedMessage = null;
  }
} 