import {findNode} from '../../utils';

export default node => {
  const header =
    findNode(
      node,
      currentNode => !!currentNode?.cssClasses?.includes('tabs-content'),
    )?.children || [];

  return {
    defaultIndex: node.activeTab ? parseInt(node.activeTab, 10) : 0,
    tabNavigationAlignment: 'left',
    headers: header.map(item => item.tabName),
    view_all_url: node.viewAllUrl || node.view_all_url,
    view_all_title: node.viewAllTitle || node.view_all_title || 'Show All',
  };
};
