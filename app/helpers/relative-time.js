import { helper } from '@ember/component/helper';

export function relativeTime([ms]) {
  if (!ms) {
    return '';
  }

  const date = new Date(ms);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) {
    return 'just now';
  } else if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  } else {
    const weeks = Math.floor(diff / 604800);
    return `${weeks}w ago`;
  }
}

export default helper(relativeTime);
