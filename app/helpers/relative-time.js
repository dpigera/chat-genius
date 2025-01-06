import { helper } from '@ember/component/helper';

export function relativeTime([ms]) {
  if (!ms) {
    return '';
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  // Build the timestamp string
  const hoursString = hours > 0 ? `${hours} hr${hours !== 1 ? 's' : ''}` : '';
  const minutesString =
    minutes > 0 ? `${minutes} min${minutes !== 1 ? 's' : ''}` : '';
  const secondsString =
    seconds > 0 ? `${seconds} sec${seconds !== 1 ? 's' : ''}` : '';

  // Combine the parts, ensuring proper spacing and avoiding leading/trailing spaces
  return [hoursString, minutesString, secondsString].filter(Boolean).join(' ');
}

export default helper(relativeTime);
