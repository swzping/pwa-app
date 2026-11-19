import {getBackgroundImages, getAdvanced} from '../../utils';

export default node => {
  const advanced = getAdvanced(node);
  if (node?.borderRadius || advanced.backgroundColor) {
    advanced.marginHorizontal = 12;
  }

  return {
    borderRadius: node?.borderRadius,
    marginTop: node?.marginTop,
    marginBottom: node?.marginBottom,
    ...advanced,
    ...getBackgroundImages(node),
  };
};
