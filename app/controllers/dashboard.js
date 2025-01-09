import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DashboardController extends Controller {
  @service router;
  @service session;
  @service s3Upload;
  @service search;
  @service pocketbase;

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
  @tracked isMessageEmojiPickerVisible = false;
  @tracked searchText = '';
  @tracked isSearchPopupVisible = false;
  @tracked selectedSearchResult = null;

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
      const messages = await this.pocketbase.getChannelMessages(this.selectedChannelId);
      this.messages = messages;

      // subscribe to new channel 
      try {
        await this.pocketbase.client.collection('messages').subscribe('*', async (change) => {
          if (change.action === 'create') {
            console.log(change.record);
          
            const userID = change.record.user;
            const user = await this.pocketbase.getUser(userID);
            
            change.record.expand = {};
            change.record.expand.user = {};
            change.record.expand.user = user;
          
            if (change.record.channel === this.selectedChannelId || change.record.directMessage === this.selectedUserId) {
              this.messages = [...this.messages, change.record];
              setTimeout(() => this.scrollToBottom(), 0);
            }
            
          }
        });
        console.log('subscribed');
      } catch (error) {
        console.error('Error subscribing to messages:', error);
      }


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
      const messages = await this.pocketbase.getDirectMessages(this.selectedUserId);
      this.messages = messages;
    } catch(error) {
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
  addEmojiToMessage(emoji) {
    this.messageText = `${this.messageText}${emoji}`;
    this.isMessageEmojiPickerVisible = false;
  }

  @action
  scrollToBottom() {
    const messageContainer = document.querySelector('.messages-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  @action
  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { url, fileName, fileEmoji } = await this.s3Upload.uploadFile(file);

      const newMessage = {
        id: String(Date.now()),
        content: `${fileEmoji} File uploaded: ${fileName}`,
        fileInfo: {
          name: fileName,
          url: url
        },
        user: {
          id: '3',
          name: 'Devin Pigera',
          avatar: 'DP'
        },
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        replyCount: 0,
        reactionCount: 0
      };

      this.messages = [...this.messages, newMessage];
      event.target.value = '';
      
      // Scroll to bottom after adding new message
      setTimeout(() => this.scrollToBottom(), 0);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  @action
  async postMessage() {
    if (!this.messageText.trim()) return;

    let newMessage = {
      body: this.messageText,
      user: this.pocketbase.currentUser.id,
    };

    // set channel or directChannel
    if (this.selectedChannelId) {
      newMessage.channel = this.selectedChannelId;
    }
    if (this.selectedUserId) {
      newMessage.directMessage =this.selectedUserId;
    }
    await this.pocketbase.client.collection('messages').create(newMessage);
    this.messageText = '';
    
    // Scroll to bottom after adding new message
    setTimeout(() => this.scrollToBottom(), 0);
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

  @action
  updateSearchText(event) {
    this.searchText = event.target.value;
    
    if (this.selectedSearchResult) {
      this.selectedSearchResult = null;
    }
    
    this.isSearchPopupVisible = this.searchText.length > 0;
    
    if (this.searchText.length > 0) {
      this.search.search(this.searchText);
    }
  }

  @action
  clearSearch() {
    this.searchText = '';
    this.isSearchPopupVisible = false;
    this.selectedSearchResult = null;
  }

  @action
  focusSearch() {
    if (this.selectedSearchResult) {
      this.selectedSearchResult = null;
    }
    this.isSearchPopupVisible = this.searchText.length > 0;
  }

  @action
  selectSearchResult(result) {
    this.selectedSearchResult = result;
    this.isSearchPopupVisible = false;
  }

  @action
  closeFullScreenPopup() {
    this.selectedSearchResult = null;
    this.searchText = '';
    this.isSearchPopupVisible = false;
  }
} 