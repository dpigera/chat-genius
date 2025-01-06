import EmberRouter from '@ember/routing/router';
import config from 'player-basic/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('play', { resetNamespace: false }, function () {
    this.route('episode', { path: ':request_id' });
  });
});
