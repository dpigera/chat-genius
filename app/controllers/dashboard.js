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
  @tracked messagesSubscription = null;

  init() {
    super.init(...arguments);
    setTimeout(() => {
      if (this.model?.channels?.length > 0) {
        this.selectChannel(this.model.channels[0].id);
      }
    }, 1000);
    
    // Start listening for messages when dashboard initializes
    this.messageSubscription = this.subscribeToMessages();
  }

  subscribeToMessages() {
    return this.pocketbase.client
      .collection('messages')
      .subscribe('*', async (data) => {

        let message = data.record;
        let user = await this.pocketbase.getUser(message.user);
        message.expand = {};
        message.expand.user = user; 

        if (message.directMessage) {
          if (this.selectedUserId === message.directMessageId) {
            this.messages = [...this.messages, message];
          }
        } 
        else if (message.channel) {
          if (this.selectedChannelId === message.channel) {
            this.messages = [...this.messages, message];
          }
        }
      });
  }

  willDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  @action
  async selectChannel(channelId) {
    this.selectedChannelId = channelId;
    this.selectedUserId = null;
    this.isThreadVisible = false; // Hide thread when changing channels
    try {
      const messages = await this.pocketbase.getChannelMessages(this.selectedChannelId);
      this.messages = [];
      this.messages = messages;

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
      const replies = await this.pocketbase.getReplies(message.id);
      this.replies = replies;
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
      // setTimeout(() => this.scrollToBottom(), 0);
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
    // setTimeout(() => this.scrollToBottom(), 0);
  }

  @action
  updateReplyText(event) {
    this.replyText = event.target.value;
  }

  @action
  async postReply() {
    if (!this.replyText.trim() || !this.selectedMessage) return;
    let newReply = {
      body: this.replyText,
      user: this.pocketbase.currentUser.id,
      message: this.selectedMessage.id
    }

    try {
      // create reply
      await this.pocketbase.client.collection('replies').create(newReply);

      // increment reply counts
      let msg = await this.pocketbase.client.collection('messages').getOne(this.selectedMessage.id);
      msg.replyCount = (msg.replyCount || 0) + 1;
      await this.pocketbase.client.collection('messages').update(this.selectedMessage.id, msg);

      // add user to newReply (for initials)
      newReply.expand = {};
      newReply.expand.user = {};
      newReply.expand.user = this.pocketbase.currentUser;
      this.replies = [...this.replies, newReply];
      this.isThreadVisible = true;

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