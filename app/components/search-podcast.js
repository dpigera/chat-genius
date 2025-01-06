import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout, restartableTask } from 'ember-concurrency';
import fetch from 'fetch';
import config from 'player-basic/config/environment';

export default class SearchFieldComponent extends Component {
  debounceDuration = 600;
  @tracked error = null;
  @tracked data = null;
  @tracked query = null;
  @tracked collectionID = null;
  @tracked episodes = null;

  @tracked email = 'dpigera@gmail.com';
  @tracked promptEmail = false;
  @tracked payload = null;

  @tracked promptSuccess = false;

  @restartableTask *searchTask(query) {
    yield timeout(this.debounceDuration);

    this.error = null;
    this.data = null;
    this.collectionID = null;
    this.episodes = null;
    this.payload = null;

    if (query.length === 0) {
      return;
    }

    try {
      // Search podcast
      const host = config.APP.API_HOST;
      let response = yield fetch(
        `${host}/api/podcasts/search?keyword=${query}`,
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = yield response.json();
      this.data = json.results;
    } catch (e) {
      this.error = e;
    }
  }

  @action onClickEpisode(episode) {
    this.payload = {
      meta: episode.meta,
      episode: episode,
    };
    delete this.payload.episode.meta;
    this.promptEmail = true;
  }

  @action onInput(event) {
    this.query = event.target.value;
    this.searchTask.perform(this.query);
  }

  @action async submitEmail() {
    this.promptEmail = false;
    this.payload.email = this.email;

    const host = config.APP.API_HOST;
    const url = `${host}/api/podcasts/transcribe`;
    const data = this.payload;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // const result = await response.json();
        this.promptSuccess = true;
      }
    } catch (e) {
      console.log(e);
    }
  }

  @action reset() {
    this.error = null;
    this.data = null;
    this.query = null;
    this.collectionID = null;
    this.episodes = null;

    this.promptEmail = false;
    this.payload = null;

    this.promptSuccess = false;
  }

  @action cancelEmail() {
    this.email = 'dpigera@gmail.com';
    this.promptEmail = false;
  }

  @task *onClick(podcast) {
    this.error = null;
    this.data = null;
    this.query = null;
    this.collectionID = podcast.collectionId;
    this.episodes = null;
    this.payload = null;

    // Fetch podcast
    console.log('collectionID = ', this.collectionID);
    try {
      // Search podcast
      const host = config.APP.API_HOST;
      let response = yield fetch(
        `${host}/api/podcasts/episodes/${this.collectionID}`,
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = yield response.json();
      this.episodes = json.results.slice(1, 6);
      this.episodes.forEach((e) => {
        e.meta = json.results[0];
      });
    } catch (e) {
      this.error = e;
    }
  }
}
