import {getAdvanced} from '../../utils';

export default (node, props) => {
  const dataNode = props.appearance === 'contained' ? node.children[0] : node;
  return {
    ...getAdvanced(dataNode),
  };
};
