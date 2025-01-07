import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DashboardController extends Controller {
  @service router;
  @service session;

  @tracked isProfileOpen = false;
  @tracked selectedChannelId = null;
  @tracked selectedUserId = null;
  @tracked messages = [];
  @tracked isThreadVisible = false;
  @tracked selectedMessage = null;
  @tracked replies = [];
  @tracked isLoadingReplies = false;
  @tracked userStatus = 'active';
  @tracked messageText = '';
  @tracked replyText = '';

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

  @action
  toggleUserStatus() {
    this.userStatus = this.userStatus === 'active' ? 'away' : 'active';
  }

  @action
  async logout() {
    await this.session.invalidate();
  }

  @action
  updateMessageText(event) {
    this.messageText = event.target.value;
  }

  @action
  async postMessage() {
    if (!this.messageText.trim()) return;

    const newMessage = {
      content: this.messageText,
      user: {
        id: '3',
        name: 'Devin Pigera',
        avatar: 'DP'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      reactionCount: 0,
      replyCount: 0
    };

    if (this.selectedChannelId) {
      // Post to channel
      await fetch(`/api/channels/${this.selectedChannelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage)
      });
    } else if (this.selectedUserId) {
      // Post to DM
      await fetch(`/api/directmsgs/${this.selectedUserId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage)
      });
    }

    // Add to current messages list
    this.messages = [...this.messages, newMessage];
    
    // Clear input
    this.messageText = '';
  }

  @action
  updateReplyText(event) {
    this.replyText = event.target.value;
  }

  @action
  async postReply() {
    if (!this.replyText.trim() || !this.selectedMessage) return;

    const newReply = {
      content: this.replyText,
      user: {
        id: '3',
        name: 'Devin Pigera',
        avatar: 'DP'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };

    try {
      await fetch(`/api/messages/${this.selectedMessage.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReply)
      });

      // Update replies list
      this.replies = [...this.replies, newReply];
      
      // Update reply count on original message
      this.selectedMessage.replyCount = (this.selectedMessage.replyCount || 0) + 1;
      
      // Clear input
      this.replyText = '';
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  }
} 