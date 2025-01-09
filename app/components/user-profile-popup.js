import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserProfilePopupComponent extends Component {
  @service pocketbase;
  @tracked currentStatus = null;

  constructor() {
    super(...arguments);
    this.getUserStatus();
  }

  async getUserStatus() {
    let myUser = await this.pocketbase.getUser(this.pocketbase.currentUser.id);
    this.currentStatus = myUser.onlineStatus;
  }

  @action
  async updateUserStatus(event) {
    const status = event.target.value;
    try {
      await this.pocketbase.setMyStatus(status);
      this.currentStatus = status;
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }
} 