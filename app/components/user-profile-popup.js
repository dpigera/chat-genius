import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserProfilePopupComponent extends Component {
  @service session;
  @service router;

  @action
  async signOut() {
    await this.session.invalidate();
    this.router.transitionTo('login');
  }

  @action
  setupClickOutside() {
    // ... existing click outside logic ...
  }

  @action
  teardownClickOutside() {
    // ... existing cleanup logic ...
  }
} 