import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class DashboardController extends Controller {
  @tracked isProfileOpen = false;
} 