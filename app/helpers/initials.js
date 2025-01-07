import { helper } from '@ember/component/helper';

export function initials([text]) {
    
  if (typeof text !== 'string') {
    return '';
  }
  return text?.split(' ').map(name => name[0]).join('');
}

export default helper(initials);
