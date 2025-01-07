import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default class SearchService extends Service {
  @service api;
  
  @tracked userResults = [];
  @tracked messageResults = [];
  @tracked isLoading = false;

  async search(term) {
    if (!term.trim()) {
      this.userResults = [];
      this.messageResults = [];
      return;
    }
    
    debounce(this, this._performSearch, term, 300);
  }

  async _performSearch(term) {
    try {
      this.isLoading = true;

      const [userResults, messageResults] = await Promise.all([
        this.api.searchUsers(term),
        this.api.searchMessages(term)
      ]);

      // Update results after both API calls complete
      this.userResults = userResults;
      this.messageResults = messageResults;
    } catch (error) {
      console.error('Search error:', error);
      this.userResults = [];
      this.messageResults = [];
    } finally {
      this.isLoading = false;
    }
  }
} 