import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import config from '../config/environment';

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

  @tracked isAIColumnVisible = true;

  @tracked agentMessages = [{
    isAgent: true,
    message: "Hi! I'm Devin, an AI assistant at ChatGenius. I can do things like search for information and summarize records. What can I help you with?",
    timestamp: "11:30 AM",
    sender: "Agent Devin"
  }];

  @tracked aiMessageText = '';

  // Add this array of sample messages
  sampleMessages = [
    {
      "message": "Hey, have you guys seen Gauntlet AI? It's all over my feed lately.",
      "user_name": "Devin Pigera",
      "user_id": "u665p7g231qaq49",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T09:00:00"
    },
    {
      "message": "Yeah, Devin, 12 weeks of intense AI training? Sounds insane but awesome.",
      "user_name": "Zac Smith",
      "user_id": "8d74bge2104rqb9",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T09:10:00"
    },
    {
      "message": "It’s legit hardcore. 80-100 hours a week, and they’re training you to be the best AI engineer out there.",
      "user_name": "Austin Allred",
      "user_id": "dks7fpk3p220txl",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T09:20:00"
    },
    {
      "message": "Plus, it’s free, and you get a $200K job at the end if you finish. Like, who does that?",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T09:30:00"
    },
    {
      "message": "Okay, so how did Gauntlet AI even start? What’s their deal?",
      "user_name": "Devin Pigera",
      "user_id": "u665p7g231qaq49",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T09:40:00"
    },
    {
      "message": "It started from training engineers to work with cutting-edge AI. Companies realized the potential and went all in.",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T09:50:00"
    },
    {
      "message": "Yeah, they’re saying AI is the biggest force multiplier in history. Like, it’s going to reshape everything.",
      "user_name": "Austin Allred",
      "user_id": "dks7fpk3p220txl",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T10:00:00"
    },
    {
      "message": "And they’re pouring hundreds of millions into finding and training the smartest, hardest-working people.",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T10:10:00"
    },
    {
      "message": "The whole program’s modeled after Trilogy University. That was super successful for training engineers.",
      "user_name": "Zac Smith",
      "user_id": "8d74bge2104rqb9",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T10:20:00"
    },
    {
      "message": "It’s a mix of real-world challenges and intense learning. Like, they’re building elite AI engineers.",
      "user_name": "Austin Allred",
      "user_id": "dks7fpk3p220txl",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T10:30:00"
    },
    {
      "message": "They’re pretty upfront about it—it’s the hardest you’ll ever work. But also the fastest you’ll ever learn.",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T10:40:00"
    },
    {
      "message": "I saw that. They basically want you to build faster, learn faster, and just keep pushing.",
      "user_name": "Devin Pigera",
      "user_id": "u665p7g231qaq49",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T10:50:00"
    },
    {
      "message": "And if you survive the 12 weeks, you walk into a $200K job. Feels worth it.",
      "user_name": "Zac Smith",
      "user_id": "8d74bge2104rqb9",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T11:00:00"
    },
    {
      "message": "The roadmap’s pretty clear too. First step—apply by January 4 and take the aptitude test.",
      "user_name": "Austin Allred",
      "user_id": "dks7fpk3p220txl",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T11:10:00"
    },
    {
      "message": "That’s the CCAT, right? Logic, math, patterns? You need a score of 40+?",
      "user_name": "Devin Pigera",
      "user_id": "u665p7g231qaq49",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T11:20:00"
    },
    {
      "message": "Yeah, that’s the one. Then remote classes start January 6. They let you know by January 5 if you’re in.",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T11:30:00"
    },
    {
      "message": "Next step—move to Austin by February 3. They cover travel and accommodation, so no worries there.",
      "user_name": "Austin Allred",
      "user_id": "dks7fpk3p220txl",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T11:40:00"
    },
    {
      "message": "The program wraps up March 28. If you pass, you start the $200K job right after.",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T11:50:00"
    },
    {
      "message": "What’s the curriculum like? I heard it’s all project-based?",
      "user_name": "Zac Smith",
      "user_id": "8d74bge2104rqb9",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T12:00:00"
    },
    {
      "message": "Yup, it’s split into two main parts. Part 1 is the Speed Build—you rebuild a production-grade app super fast.",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T12:10:00"
    },
    {
      "message": "Then Part 2 is the AI Evolution. You take that app and integrate cutting-edge AI features.",
      "user_name": "Austin Allred",
      "user_id": "dks7fpk3p220txl",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T12:20:00"
    },
    {
      "message": "So you’re basically proving you can build fast and innovate under pressure?",
      "user_name": "Devin Pigera",
      "user_id": "u665p7g231qaq49",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T12:30:00"
    },
    {
      "message": "Exactly. They’re looking for elite engineers who can handle both—scaling systems and pushing AI boundaries.",
      "user_name": "Ashalesh Tilawat",
      "user_id": "a75158r8xfsh928",
      "channel_id": "7j4b0bkdl2hv3os",
      "channel_name": "gauntlet-ai",
      "file": "none",
      "timestamp": "2025-01-16T12:40:00"
    }
  ];

  // Get the API URL from config
  promptApiUrl = config.APP.PROMPT_API_URL;

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
      messages.forEach(message => {
        if (message?.expand?.user?.avatar) {
          let host = config.APP.API_HOST;
          let userId = message.expand.user.id;
          let avatar = message.expand.user.avatar;
          let url = `${host}/api/files/_pb_users_auth_/${userId}/${avatar}?token=`;
          message.avatarUrl = url;
        }
      })
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

  @action
  toggleAIColumn() {
    this.isAIColumnVisible = !this.isAIColumnVisible;
  }

  @action
  closeAIColumn() {
    this.isAIColumnVisible = false;
  }

  @action
  updateAIMessageText(event) {
    this.aiMessageText = event.target.value;
  }

  @action
  async sendAIMessage() {
    if (!this.aiMessageText.trim()) return;
    
    this.isAILoading = true;
    
    this.agentMessages = [...this.agentMessages, {
      isAgent: false,
      message: this.aiMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: "User"
    }];

    const userPrompt = this.aiMessageText;
    this.aiMessageText = '';

    try {
      const response = await fetch(`${this.promptApiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt
        })
      });

      const data = await response.json();

      this.agentMessages = [...this.agentMessages, {
        isAgent: true,
        message: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: "Agent Devin"
      }];
    } catch (error) {
      console.error('AI response error:', error);
    } finally {
      this.isAILoading = false;
    }
  }

  @action
  async populateMessages() {
    let final = [];
    try {
      for (const message of this.sampleMessages) {
        let msg = {
          body:message.message, 
          channel:message.channel_id, 
          directMessageId: null, 
          file: null,
          timestamp: new Date(message.timestamp),
          user: message.user_id
        }
        final.push(msg);


        await this.pocketbase.createMessage({
          body:message.message, 
          channelId:message.channel_id, 
          directMessageId: null, 
          file: null,
          timestamp: new Date(message.timestamp),
          user: message.user_id
        });
      }
      console.log(JSON.stringify(final));
    } catch (error) {
      console.error('Failed to populate messages:', error);
    }
  }
} 


