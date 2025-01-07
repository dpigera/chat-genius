import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service router;

  async beforeModel() {
    await this.session.setup();

    // If user is authenticated and trying to access the root or login route,
    // redirect them to dashboard
    if (this.session.isAuthenticated) {
      const currentRouteName = this.router.currentRouteName;
      if (currentRouteName === 'login' || currentRouteName === 'index' || currentRouteName === null) {
        this.router.transitionTo('dashboard');
      }
    }else{
        this.router.transitionTo('login');
    }
  }
}