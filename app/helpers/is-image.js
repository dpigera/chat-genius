import { helper } from '@ember/component/helper';

export default helper(function isImage([url]) {
  if (!url) return false;
  
  // Extract filename from pocketbase URL
  try {
    const filename = url.split('/').pop();
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  } catch (e) {
    return false;
  }
}); 