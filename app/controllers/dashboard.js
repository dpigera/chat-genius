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
  @tracked reactMsgRowIndex = null;

  @tracked searchText = '';
  @tracked isSearchPopupVisible = false;
  @tracked isSearching = false;
  @tracked searchResults = {
    users: [],
    messages: []
  };

  @tracked messagesSubscription = null;
  @tracked repliesSubscription = null;
  @tracked channelSubscription = null;
  @tracked userStatusSubscription = null;

  @tracked isAddChannelModalVisible = false;
  @tracked newChannelName = '';
  @tracked selectedUserIds = [];
  
  @tracked channels = [];
  @tracked directMessages = [];
  @tracked users = [];

  @tracked isAddDirectMessageModalVisible = false;
  @tracked selectedDMUserIds = [];

  @tracked activeReactionMessageId = null;

  @tracked isUploading = false;
  @tracked fileToUpload = null;

  @tracked isMobileMenuOpen = false;

  init() {
    super.init(...arguments);

    this.loadUsers();
    this.loadInitialData();
  
    // Start listening for messages when dashboard initializes
    this.messageSubscription = this.subscribeToMessages();
    this.repliesSubscription = this.subscribeToReplies();
    this.channelSubscription = this.subscribeToChannels();
    this.userStatusSubscription = this.subscribeToUserStatus();
  }

  async loadInitialData() {
    try {
      await this.pocketbase.authSuperUser();
    } catch(e) {
      console.log(e);
    }

    try {
      // Load all data in parallel
      const [channels, directMessages, users] = await Promise.all([
        this.pocketbase.getChannels(),
        this.pocketbase.getMyDirectChannels(),
        this.pocketbase.getUsers()
      ]);

      // Set the data
      this.channels = channels;
      this.directMessages = directMessages;
      this.users = users;

      setTimeout(() => {
        if (this.channels?.length > 0) {
          this.selectChannel(this.channels[0].id);
        }
      }, 10);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  async subscribeToUserStatus() {
    return this.pocketbase.client
      .collection('users')
      .subscribe('*', async (data) => {
        let directChannels = await this.pocketbase.getMyDirectChannels();
        this.directMessages = directChannels;
      });
  }

  async subscribeToChannels() {
    return this.pocketbase.client
      .collection('channels')
      .subscribe('*', async (data) => {
        
      try {
        const [channels, directChannels] = await Promise.all([
          this.pocketbase.getMyChannels(),
          this.pocketbase.getMyDirectChannels()
        ]);

        this.channels = channels;
        this.directMessages = directChannels;
        
      } catch (error) {
        console.error('Failed to reload channels:', error);
      }
        
      });
  }

  async subscribeToMessages() {
    return this.pocketbase.client
      .collection('messages')
      .subscribe('*', async (data) => {
        if (data.action === 'create') {
          // let message = data.record;
          // let user = await this.pocketbase.getUser(message.user);
          // message.expand = {};
          // message.expand.user = user; 

          let message = await this.pocketbase.getMessage(data.record.id);
  
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
        }

        if (data.action === 'update') {
          let messageIndex = this.messages.findIndex(msg => msg.id === data.record.id);
          if (messageIndex !== -1) {
            const updatedMessage = {
              ...this.messages[messageIndex],
              replyCount: (this.messages[messageIndex].replyCount || 0) + 1
            };

            this.messages = [
              ...this.messages.slice(0, messageIndex),
              updatedMessage,
              ...this.messages.slice(messageIndex + 1)
            ];
          }  
        }
      });
  }

  async subscribeToReplies() {
    return this.pocketbase.client
      .collection('replies')
      .subscribe('*', async (data) => {

        
        if (data.action === 'create') {
          if (this.isThreadVisible === true) {
            if (data.record.user !== this.pocketbase.currentUser.id) {
              const replies = await this.pocketbase.getReplies(data.record.message);
              this.replies = [];
              this.replies = replies;
            }
          }
        }      
      });
  }

  willDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.repliesSubscription.unsubscribe();
    }
    
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
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
  addEmojiToChat(emoji) {
    // this.messageText = `${this.messageText}${emoji}`;
    // this.isMessageEmojiPickerVisible = false;
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
      this.isUploading = true;

      await this.pocketbase.createMessage({
        body: this.messageText || '',
        channelId: this.selectedChannelId,
        directMessageId: this.selectedUserId,
        file: file  // Pass the file directly
      });

      // Clear the input
      event.target.value = '';
      this.messageText = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.isUploading = false;
    }
  }

  @action
  async postMessage() {
    if (!this.messageText && !this.fileToUpload) return;

    try {
      await this.pocketbase.createMessage({
        body: this.messageText,
        channelId: this.selectedChannelId,
        directMessageId: this.selectedUserId,
        file: this.fileToUpload
      });

      this.messageText = '';
      this.fileToUpload = null;
    } catch (error) {
      console.error('Failed to post message:', error);
    }
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
  async updateSearchText(event) {
    this.searchText = event.target.value;
    this.isSearchPopupVisible = this.searchText.length > 0;
    
    if (this.searchText.length >= 2) {
      this.isSearching = true;
      
      try {
        // Run both searches in parallel
        const [users, messages] = await Promise.all([
          this.pocketbase.searchUsers(this.searchText),
          this.pocketbase.searchMessages(this.searchText)
        ]);
        
        this.searchResults = { users, messages };
      } catch (error) {
        console.error('Search failed:', error);
        this.searchResults = { users: [], messages: [] };
      } finally {
        this.isSearching = false;
      }
    } else {
      this.searchResults = { users: [], messages: [] };
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

  async loadUsers() {
    this.users = await this.pocketbase.getUsers();
  }

  @action
  showAddChannelModal() {
    this.isAddChannelModalVisible = true;
  }

  @action
  hideAddChannelModal() {
    this.isAddChannelModalVisible = false;
    this.newChannelName = '';
    this.selectedUserIds = [];
  }

  @action
  updateChannelName(event) {
    this.newChannelName = event.target.value;
  }

  @action
  updateSelectedUsers(event) {
    const selectedOptions = Array.from(event.target.selectedOptions);
    this.selectedUserIds = selectedOptions.map(option => option.getAttribute('user-id'));
    
  }

  @action
  async createChannel() {
    if (!this.isValidChannel) return;
    
    try {
      // Make sure we're getting user IDs, not names
      const userIds = [...this.selectedUserIds, this.pocketbase.currentUser.id];
      
      
      await this.pocketbase.createChannel({
        name: this.newChannelName.trim(),
        users: userIds // This will now contain actual user IDs
      });
      
      // Reset and close modal
      this.hideAddChannelModal();
      
      // refresh
      let channels = await this.pocketbase.getMyChannels();
      this.channels = channels;
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  }

  get isValidChannel() {
    return this.newChannelName.trim() && this.selectedUserIds.length > 0;
  }

  @action
  showAddDirectMessageModal() {
    this.isAddDirectMessageModalVisible = true;
  }

  @action
  hideAddDirectMessageModal() {
    this.isAddDirectMessageModalVisible = false;
    this.selectedDMUserIds = [];
  }

  @action
  updateSelectedDMUsers(event) {
    const selectedOptions = Array.from(event.target.selectedOptions);
    this.selectedDMUserIds = selectedOptions.map(option => option.value);
  }

  @action
  async createDirectMessage() {
    if (!this.isValidDirectMessage) return;

    try {
      // Add current user to the selected users
      const userIds = [...this.selectedDMUserIds, this.pocketbase.currentUser.id];
      await this.pocketbase.createDirectChannel(userIds);

      this.hideAddDirectMessageModal();

      let directChannels = await this.pocketbase.getMyDirectChannels();
      this.directMessages = directChannels;
    } catch (error) {
      console.error('Failed to create direct message:', error);
    }
  }

  get isValidDirectMessage() {
    return this.selectedDMUserIds.length > 0;
  }

  @action
  async addReaction(messageId, emoji) {
    try {
      // create reaction
      const data = {
        message: messageId,
        user: this.pocketbase.currentUser.id,
        emoji: emoji
      };
      const reaction = await this.pocketbase.client.collection('reactions').create(data);

      // add reaction to message
      let message = await this.pocketbase.client.collection('messages').getOne(messageId);
      message.reactions = [...message.reactions, reaction.id];
      await this.pocketbase.client.collection('messages').update(messageId, message);

      // fetch messages
      let messages = [];
      if (this.selectedChannelId) {
        messages = await this.pocketbase.getChannelMessages(this.selectedChannelId);
      } else if (this.selectedUserId) {
        messages = await this.pocketbase.getDirectMessages(this.selectedUserId);
      }
      this.messages = messages;
      this.activeReactionMessageId = null;
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }

  @action
  openMobileMenu() {
    this.isMobileMenuOpen = true;
  }

  @action
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
} 


