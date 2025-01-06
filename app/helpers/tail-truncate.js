import { helper } from '@ember/component/helper';

export function tailTruncate([text]) {
  if (typeof text !== 'string') {
    return '';
  }
  const limit = 255;
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit)}...`;
}

export default helper(tailTruncate);
