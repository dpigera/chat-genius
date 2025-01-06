import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DropDownComponent extends Component {
  @tracked audioPlayer = null;
  @tracked currentTime = 0;
  @tracked duration = 0;
  @tracked timeSaved = 0;
  @tracked ads = [];

  @tracked autoSkipAds = true;

  @action skipAd(ad) {
    this.audioPlayer.currentTime = ad.end_time;
  }

  @action toggleSkipAds() {
    this.autoSkipAds = !this.autoSkipAds;
  }

  checkAdSkip() {
    if (this.autoSkipAds === false) {
      return;
    }

    this.ads.forEach((ad) => {
      if (
        this.currentTime >= ad.start_time &&
        this.currentTime <= ad.end_time
      ) {
        this.audioPlayer.currentTime = ad.end_time;
      }
    });
  }

  @action initPlayer() {
    this.audioPlayer = document.getElementById('audioPlayer');

    this.ads = this.args.model.segments;

    this.audioPlayer.addEventListener('timeupdate', () => {
      this.currentTime = this.audioPlayer.currentTime;
      this.duration = this.audioPlayer.duration;
      this.checkAdSkip();
    });

    /*
    this.ads = [
      {
        start_time: 0.16,
        end_time: 27.935,
        text: "The future of work is arriving fast. The stakes are high and new technology is only useful if it's built on trust. At Thomson Reuters, our professional grade AI solutions are built with the most comprehensive curated content and bind with our human expertise. Transforming the way work gets done with the accuracy professionals demand built on the expertise Thomson Reuters is known for because AI is only as trustworthy as the people behind it. Learnmore@tr.com/future.",
      },
      ...
    ];
    */

    this.timeSaved = this.ads.reduce((sum, ad) => {
      return sum + (ad.end_time - ad.start_time);
    }, 0);
  }
}
