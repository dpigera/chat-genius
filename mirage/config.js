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
  // Store generated messages for both channels and DMs
  const channelMessages = new Map();
  const dmMessages = new Map();

  // Helper function to generate random messages
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
      // Find the selected user for the DM
      const selectedUser = users.find(u => u.id === userId);
      
      // Generate alternating conversation between the two users
      for (let i = 0; i < count; i++) {
        const isCurrentUser = i % 2 === 0;
        const user = isCurrentUser ? currentUser : selectedUser;
        const messageTime = new Date(baseTime - i * 1000 * 60 * getRandomNumber(5, 30));
        
        messages.push({
          id: String(i + 1),
          user: user,
          content: isCurrentUser ? 
            getRandomItem(dmMessageTemplates.response) :
            getRandomItem(dmMessageTemplates.startup),
          timestamp: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          reactionCount: getRandomNumber(0, 3),
          replyCount: 0 // DMs typically don't have threaded replies
        });
      }
    } else {
      // Regular channel messages (existing logic)
      for (let i = 0; i < count; i++) {
        const user = getRandomItem(users);
        const messageTime = new Date(baseTime - i * 1000 * 60 * getRandomNumber(5, 30));
        
        messages.push({
          id: String(i + 1),
          user: user,
          content: getRandomItem(dmMessageTemplates.startup),
          timestamp: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          reactionCount: getRandomNumber(0, 5),
          replyCount: getRandomNumber(0, 8)
        });
      }
    }

    return messages.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
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

  // Allow other endpoints to pass through
  this.passthrough();
}
