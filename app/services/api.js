import Service from '@ember/service';

export default class ApiService extends Service {
  async searchMessages(term) {
    console.log(`🔍 Calling /api/search/messages?s=${term}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock API response
    const messages = [
      {
        id: '1',
        content: `Recent discussion about ${term} in the team meeting`,
        user: { name: 'Sarah Wilson', avatar: 'SW' },
        timestamp: '2:30 PM'
      },
      {
        id: '2',
        content: `Updated documentation to include ${term} features`,
        user: { name: 'James Liu', avatar: 'JL' },
        timestamp: '1:45 PM'
      }
    ];

    console.log('📥 Messages API Response:', messages);
    return messages;
  }

  async searchUsers(term) {
    console.log(`🔍 Calling /api/search/users?s=${term}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock API response
    const users = [
      {
        id: '1',
        name: `${term.charAt(0).toUpperCase() + term.slice(1)} Thompson`,
        avatar: `${term.charAt(0).toUpperCase()}T`
      },
      {
        id: '2',
        name: `Alex ${term.charAt(0).toUpperCase() + term.slice(1)}`,
        avatar: 'AL'
      },
      {
        id: '3',
        name: `Maria ${term.charAt(0).toUpperCase() + term.slice(1)}son`,
        avatar: 'MS'
      }
    ];

    console.log('📥 Users API Response:', users);
    return users;
  }
} 