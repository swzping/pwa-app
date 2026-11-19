import {getBackgroundImages, getAdvanced} from '../../utils';

export default node => {
  return {
    text: node.content,
    view_all_title: node.viewAllTitle,
    view_all_url: node.viewAllUrl,
    hideViewAllText: node.hideViewAllText,
    ...getAdvanced(node),
    ...getBackgroundImages(node),
  };
};
