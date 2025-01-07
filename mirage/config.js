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
  // Store generated messages for each channel
  const channelMessages = new Map();

  // Helper function to generate random messages
  function generateMessages(count) {
    const users = [
      { id: '1', name: 'Sarah Chen', avatar: 'SC' },
      { id: '2', name: 'Mike Johnson', avatar: 'MJ' },
      { id: '3', name: 'Alex Kumar', avatar: 'AK' },
      { id: '4', name: 'Emma Wilson', avatar: 'EW' },
      { id: '5', name: 'David Park', avatar: 'DP' }
    ];

    const messageTemplates = [
      // Development-focused messages
      "Just pushed an update to the {feature} branch. CI is running 🤞",
      "Anyone available for a quick code review on PR #{number}?",
      "The {env} environment is down. Investigating now 🔍",
      "Updated the documentation for the new API endpoints ✨",
      "Heads up - deploying to staging in 10 minutes",
      "Found a bug in the {feature} implementation. Created issue #{number}",
      "All tests passing on the main branch 🎉",
      "New performance improvements merged - seeing {number}% faster load times",
      "Quick standup update: working on {feature} integration today",
      "Can someone help me debug this {feature} issue?",
      "Breaking change alert: updated the {feature} API contract",
      "Added new unit tests for the {feature} component",
      "Docker build is failing after the latest dependency update 😕",
      "Great job on the code review feedback, all changes implemented!",
      "Remember to update your .env files with the new config"
    ];

    const features = [
      'authentication', 'user management', 'dashboard', 'API', 
      'database', 'caching', 'search', 'notification', 'payment',
      'reporting', 'analytics', 'integration'
    ];

    const environments = ['staging', 'production', 'dev', 'QA'];

    function getRandomItem(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function formatMessage(template) {
      return template
        .replace('{feature}', getRandomItem(features))
        .replace('{env}', getRandomItem(environments))
        .replace('{number}', getRandomNumber(1, 100));
    }

    const messages = [];
    const baseTime = new Date();

    for (let i = 0; i < count; i++) {
      const user = getRandomItem(users);
      const messageTime = new Date(baseTime - i * 1000 * 60 * getRandomNumber(5, 30));
      
      messages.push({
        id: String(i + 1),
        user: user,
        content: formatMessage(getRandomItem(messageTemplates)),
        timestamp: messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        reactionCount: getRandomNumber(0, 5),
        replyCount: getRandomNumber(0, 8)
      });
    }

    return messages;
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

  // Messages endpoint that persists messages per channel
  this.get('/api/channels/:channelId/messages', (schema, request) => {
    const channelId = request.params.channelId;
    
    // If we haven't generated messages for this channel yet, do so now
    if (!channelMessages.has(channelId)) {
      const messageCount = Math.floor(Math.random() * 5) + 3; // Random between 3-7
      channelMessages.set(channelId, generateMessages(messageCount));
    }
    
    // Return the stored messages for this channel
    return {
      messages: channelMessages.get(channelId)
    };
  });

  // Allow other endpoints to pass through
  this.passthrough();
}
