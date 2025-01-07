import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { debounce } from '@ember/runloop';

export default class SearchService extends Service {
  @tracked userResults = [];
  @tracked messageResults = [];

  async search(term) {
    debounce(this, this._performSearch, term, 300);
  }

  async _performSearch(term) {
    try {
      const [userResults, messageResults] = await Promise.all([
        this.searchUsers(term),
        this.searchMessages(term)
      ]);

      this.userResults = userResults.slice(0, 3);
      this.messageResults = messageResults.slice(0, 2);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  async searchUsers(term) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = [
      { 
        id: '1', 
        name: `${term.charAt(0).toUpperCase() + term.slice(1)} Anderson`, 
        avatar: `${term.charAt(0).toUpperCase()}A` 
      },
      { 
        id: '2', 
        name: `Sarah ${term.charAt(0).toUpperCase() + term.slice(1)}son`, 
        avatar: 'SL' 
      },
      { 
        id: '3', 
        name: `Mike ${term.charAt(0).toUpperCase() + term.slice(1)}`, 
        avatar: 'MK' 
      },
      { 
        id: '4', 
        name: `${term.charAt(0).toUpperCase() + term.slice(1)} Parker`, 
        avatar: `${term.charAt(0).toUpperCase()}P` 
      }
    ];

    return results.filter(user => 
      user.name.toLowerCase().includes(term.toLowerCase())
    );
  }

  async searchMessages(term) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = [
      { 
        id: '1', 
        content: `Discussing the ${term} implementation with the team`,
        user: { name: 'Sarah Lee', avatar: 'SL' },
        timestamp: '2:30 PM'
      },
      { 
        id: '2', 
        content: `Updated the documentation for ${term} features`,
        user: { name: 'Mike Kim', avatar: 'MK' },
        timestamp: '1:45 PM'
      },
      { 
        id: '3', 
        content: `Question about ${term} in the new release`,
        user: { name: 'Alex Chen', avatar: 'AC' },
        timestamp: '11:20 AM'
      }
    ];

    return results.filter(message => 
      message.content.toLowerCase().includes(term.toLowerCase()) ||
      message.user.name.toLowerCase().includes(term.toLowerCase())
    );
  }
} 