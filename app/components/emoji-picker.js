import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class EmojiPickerComponent extends Component {
  emojis = [
    { name: 'Heart', symbol: '❤️' },
    { name: 'Thumbs Up', symbol: '👍' },
    { name: 'Thumbs Down', symbol: '👎' },
    { name: 'Lol Crying', symbol: '😂' },
    { name: 'Wow', symbol: '😮' },
    { name: 'Tears', symbol: '😭' }
  ];

  @action
  selectEmoji(symbol) {
    this.args.onSelect(symbol);
  }

  @action
  close() {
    this.args.onClose();
  }
} 