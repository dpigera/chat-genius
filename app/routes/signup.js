import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SignupRoute extends Route {
  @service pocketbase;
  @service router;

  beforeModel() {
    if (this.pocketbase.isAuthenticated) {
      this.router.transitionTo('dashboard');
    }
  }
} 