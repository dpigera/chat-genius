import { helper } from '@ember/component/helper';

export default helper(function groupBy([key, array]) {
  if (!array) return {};
  
  return array.reduce((acc, item) => {
    const value = item[key];
    acc[value] = acc[value] || [];
    acc[value].push(item);
    return acc;
  }, {});
}); 