import {
  discoverEmberDataModels,
  // applyEmberDataSerializers,
} from 'ember-cli-mirage';
import { createServer } from 'miragejs';

export default function (config) {
  let finalConfig = {
    ...config,
    // Remove discoverEmberDataModels if you do not want ember-cli-mirage to auto discover the ember models
    models: {
      ...discoverEmberDataModels(config.store),
      ...config.models
    },
    // uncomment to opt into ember-cli-mirage to auto discover ember serializers
    // serializers: applyEmberDataSerializers(config.serializers),
    routes,
  };

  return createServer(finalConfig);
}

function routes() {
  const channelMessages = new Map();
  const dmMessages = new Map();
  const messageReplies = new Map();
  let messageIdCounter = 1; // Global counter for unique message IDs

  function generateUniqueId() {
    return String(messageIdCounter++);
  }

  function generateReplies(count, parentMessage) {
    const replies = [];
    const users = [
      { id: '1', name: 'Austen Allred', avatar: 'AA' },
      { id: '2', name: 'Ashalesh Tilawat', avatar: 'AT' },
      { id: '3', name: 'Devin Pigera', avatar: 'DP' },
      { id: '4', name: 'Emma Wilson', avatar: 'EW' },
      { id: '5', name: 'David Park', avatar: 'DP' }
    ];

    const replyTemplates = [
      `Agreed, especially regarding ${parentMessage.content.split(' ').slice(0, 3).join(' ')}...`,
      "Good point! Let me follow up on this.",
      "I can help with this.",
      "Thanks for bringing this up.",
      "Here's what I found out about this...",
      "I've been working on something similar.",
      "Let me check and get back to you.",
      "This is exactly what we needed.",
      "Can you provide more details?",
      "I'll schedule a follow-up meeting about this."
    ];

    const baseTime = new Date(parentMessage.rawTimestamp || new Date());

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const messageTime = new Date(baseTime.getTime() + (i + 1) * 1000 * 60 * 5); // 5 minutes after previous

      replies.push({
        id: generateUniqueId(),
        user: user,
        content: replyTemplates[Math.floor(Math.random() * replyTemplates.length)],
        timestamp: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        rawTimestamp: messageTime,
        reactionCount: Math.floor(Math.random() * 3)
      });
    }

    return replies;
  }

  function generateMessages(count, isDM = false, userId = null) {
    const users = [
      { id: '1', name: 'Austen Allred', avatar: 'AA' },
      { id: '2', name: 'Ashalesh Tilawat', avatar: 'AT' },
      { id: '3', name: 'Devin Pigera', avatar: 'DP' }
    ];

    const currentUser = { id: '3', name: 'Devin Pigera', avatar: 'DP' };

    const dmMessageTemplates = {
      startup: [
        "Hey, quick question about the AI model deployment",
        "How's the progress on the new feature?",
        "Can we sync up about the roadmap?",
        "Just reviewed the latest metrics",
        "Thoughts on the new architecture?",
        "Got time for a quick call?",
        "Great work on the presentation yesterday",
        "Should we schedule a planning session?",
        "Have you seen the latest PR?",
        "Updates from the team meeting:"
      ],
      response: [
        "Let me take a look",
        "Sure, I'm free in 30 mins",
        "Good progress - just pushed some updates",
        "Thanks! Let me know if you need anything else",
        "Interesting approach - let's discuss",
        "I'll set up a meeting",
        "Can you share more context?",
        "On it - will get back to you shortly",
        "Makes sense to me",
        "Let's sync up on this tomorrow"
      ]
    };

    function getRandomItem(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const messages = [];
    const baseTime = new Date();

    if (isDM && userId) {
      // DM messages logic
      const selectedUser = users.find(u => u.id === userId);
      
      for (let i = 0; i < count; i++) {
        const isCurrentUser = i % 2 === 0;
        const user = isCurrentUser ? currentUser : selectedUser;
        const messageTime = new Date(baseTime - i * 1000 * 60 * Math.floor(Math.random() * 26 + 5));
        
        const messageId = generateUniqueId();
        const replyCount = Math.floor(Math.random() * 6) + 1; // 1-6 replies

        const message = {
          id: messageId,
          user: user,
          content: isCurrentUser ? 
            getRandomItem(dmMessageTemplates.response) :
            getRandomItem(dmMessageTemplates.startup),
          timestamp: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          rawTimestamp: messageTime,
          reactionCount: Math.floor(Math.random() * 3),
          replyCount: replyCount
        };

        // Generate and store replies for this message
        messageReplies.set(messageId, generateReplies(replyCount, message));
        messages.push(message);
      }
    } else {
      // Channel messages logic
      for (let i = 0; i < count; i++) {
        const user = getRandomItem(users);
        const messageTime = new Date(baseTime - i * 1000 * 60 * Math.floor(Math.random() * 26 + 5));
        
        const messageId = generateUniqueId();
        const replyCount = Math.floor(Math.random() * 8) + 1; // 1-8 replies

        const message = {
          id: messageId,
          user: user,
          content: getRandomItem(dmMessageTemplates.startup),
          timestamp: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          rawTimestamp: messageTime,
          reactionCount: Math.floor(Math.random() * 5),
          replyCount: replyCount
        };

        // Generate and store replies for this message
        messageReplies.set(messageId, generateReplies(replyCount, message));
        messages.push(message);
      }
    }

    return messages.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  }

  // Authentication endpoint
  this.post('/auth/token', (schema, request) => {
    let attrs = JSON.parse(request.requestBody);
    
    // Valid credentials check
    if (attrs.email === 'user@gauntlet.ai' && attrs.password === 'In23949dfskdsfske') {
      return {
        access_token: 'valid.mock.token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'valid.refresh.token'
      };
    } else {
      // Invalid credentials response
      return new Response(401, 
        { 'Content-Type': 'application/json' },
        { 
          errors: [{
            status: '401',
            title: 'Invalid credentials',
            detail: 'The email or password you entered is incorrect.'
          }]
        }
      );
    }
  });

  // New endpoints
  this.get('/api/channels', () => {
    return {
      channels: [
        { id: '1', name: 'development' },
        { id: '2', name: 'gauntlet-ai' },
        { id: '3', name: 'project-1' }
      ]
    };
  });

  this.get('/api/directmsgs', () => {
    return {
      users: [
        { id: '1', name: 'Austen Allred', status: 'active' },
        { id: '2', name: 'Ashalesh Tilawat', status: 'active' },
        { id: '3', name: 'Devin Pigera', status: 'active' }
      ]
    };
  });

  // Channel messages endpoint
  this.get('/api/channels/:channelId/messages', (schema, request) => {
    const channelId = request.params.channelId;
    
    if (!channelMessages.has(channelId)) {
      const messageCount = Math.floor(Math.random() * 5) + 3;
      channelMessages.set(channelId, generateMessages(messageCount));
    }
    
    return {
      messages: channelMessages.get(channelId)
    };
  });

  // DM messages endpoint
  this.get('/api/directmsgs/:userId/messages', (schema, request) => {
    const userId = request.params.userId;
    
    if (!dmMessages.has(userId)) {
      const messageCount = Math.floor(Math.random() * 5) + 3;
      dmMessages.set(userId, generateMessages(messageCount, true, userId));
    }
    
    return {
      messages: dmMessages.get(userId)
    };
  });

  // New endpoint for message replies
  this.get('/api/messages/:messageId/replies', (schema, request) => {
    const messageId = request.params.messageId;
    const replies = messageReplies.get(messageId) || [];
    
    return {
      replies: replies
    };
  });

  // POST endpoint for channel messages
  this.post('/api/channels/:channelId/messages', (schema, request) => {
    const channelId = request.params.channelId;
    const newMessage = JSON.parse(request.requestBody);
    
    // Get existing messages or initialize new array
    const existingMessages = channelMessages.get(channelId) || [];
    
    // Add new message with unique ID
    newMessage.id = String(messageIdCounter++);
    existingMessages.push(newMessage);
    
    // Update stored messages
    channelMessages.set(channelId, existingMessages);
    
    return newMessage;
  });

  // POST endpoint for DM messages
  this.post('/api/directmsgs/:userId/messages', (schema, request) => {
    const userId = request.params.userId;
    const newMessage = JSON.parse(request.requestBody);
    
    // Get existing messages or initialize new array
    const existingMessages = dmMessages.get(userId) || [];
    
    // Add new message with unique ID
    newMessage.id = String(messageIdCounter++);
    existingMessages.push(newMessage);
    
    // Update stored messages
    dmMessages.set(userId, existingMessages);
    
    return newMessage;
  });

  // POST endpoint for message replies
  this.post('/api/messages/:messageId/replies', (schema, request) => {
    const messageId = request.params.messageId;
    const newReply = JSON.parse(request.requestBody);
    
    // Get existing replies or initialize new array
    const existingReplies = messageReplies.get(messageId) || [];
    
    // Add new reply with unique ID
    newReply.id = String(messageIdCounter++);
    existingReplies.push(newReply);
    
    // Update stored replies
    messageReplies.set(messageId, existingReplies);
    
    return newReply;
  });

  // Mock file upload endpoint
  this.post('/api/files/upload', (schema, request) => {
    return {
      url: 'https://fake-s3-bucket.s3.amazonaws.com/uploaded-file.pdf',
      fileName: 'uploaded-file.pdf'
    };
  });

  // Allow other endpoints to pass through
  this.passthrough();
}
