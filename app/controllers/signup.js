import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SignupController extends Controller {
  @service pocketbase;
  @service router;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked email = '';
  @tracked password = '';
  @tracked errorMessage = '';
  @tracked isLoading = false;

  @action
  async handleSignup(event) {
    event.preventDefault();
    this.errorMessage = '';
    this.isLoading = true;

    try {
      await this.pocketbase.register({
        email: this.email,
        password: this.password,
        passwordConfirm: this.password,
        firstName: this.firstName,
        lastName: this.lastName
      });
      
      this.router.transitionTo('dashboard');
    } catch (error) {
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
} 