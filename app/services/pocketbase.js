import Service from '@ember/service';
import PocketBase from 'pocketbase';
import { tracked } from '@glimmer/tracking';
// import { inject as service } from '@ember/service';
// import config from '../config/environment';

export default class PocketbaseService extends Service {
  @tracked currentUser = null;

  constructor() {
    super(...arguments);
    this.client = new PocketBase('http://127.0.0.1:8090');
  }

  get initials() {
    return this.currentUser?.name?.split(' ').map(name => name[0]).join('');
  }

  get name() {
    return this.currentUser?.name;
  }
}
