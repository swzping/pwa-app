import {getAdvanced} from '../../utils';

export default (node, props) => {
  return {
    ...getAdvanced(node),
  };
};
