import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SignupController extends Controller {
  @service pocketbase;
  @service router;
  @service session;

  @tracked errorMessage = '';
  @tracked isLoading = false;

  @action
  async handleSignup(event) {
    event.preventDefault();
    this.errorMessage = '';
    this.isLoading = true;
    try {
      const firstName = event.target.firstName.value;
      const lastName = event.target.lastName.value;
      const email = event.target.email.value;
      const password = event.target.password.value;

      // Register
      await this.pocketbase.register({
        email: email,
        password: password,
        passwordConfirm: password,
        firstName: firstName,
        lastName: lastName
      });
      
      // Login if successful
      await this.session.authenticate('authenticator:jwt', { 
        email, 
        password 
      });
      await this.router.transitionTo('dashboard');

    } catch (error) {
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
} 