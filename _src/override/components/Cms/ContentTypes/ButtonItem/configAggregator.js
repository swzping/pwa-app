import {findNode, getAdvanced} from '../../utils';

export default node => {
  const textNode = findNode(
    node,
    currentNode => currentNode?.element === 'link_text',
  );

  const {pbStyleInline, children} = node;
  const firstChild = children[0] || {};
  const {cssClasses = [], tagName} = firstChild;

  const props = {
    text: textNode?.text,
    textAlign: pbStyleInline?.textAlign,
    ...getAdvanced(firstChild),
    buttonType: cssClasses.includes('pagebuilder-button-secondary')
      ? 'secondary'
      : cssClasses.includes('pagebuilder-button-link')
      ? 'link'
      : 'primary',
  };

  if (tagName === 'a') {
    props.link = firstChild.href;
    props.linkType = firstChild.linkType;
  }

  return props;
};
