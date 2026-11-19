import {parsePbStyleInline, getAdvanced} from '../../utils';

export default (node, props, pNode) => {
  const advanced = getAdvanced(node);
  const base = {
    isSameWidth: node.sameWidth,
    ...advanced,
  };

  if (pNode.contentTypeMap === 'row') {
    const {textAlign} = parsePbStyleInline(pNode);
    if (['center', 'right'].includes(textAlign)) {
      return {
        ...base,
        textAlign,
      };
    }
  }

  return base;
};
