import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginController extends Controller {
  @service router;

  @action
  signIn() {
    // Here you would normally handle authentication
    // For now, we'll just redirect to the dashboard
    this.router.transitionTo('dashboard');
  }
} 