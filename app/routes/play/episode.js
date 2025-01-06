import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import config from 'player-basic/config/environment';

export default class PlayEpisodeRoute extends Route {
  @service store;
  async model(params) {
    try {
      const host = config.APP.API_HOST;
      const url = `${host}/api/podcasts/play/${params.request_id}`;
      let response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      return json;
    } catch (e) {
      this.error = e;
    }
  }
}
