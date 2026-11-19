import React, {useState} from 'react';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRoute} from '@react-navigation/native';
import {modules} from '@root/swift.config';
import {TYPE_BLOCK, PREFIX_API_WHATSAPP} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {
  GET_CMS_BLOCK,
  GET_CMS_PAGE,
} from '@app/_modules/cms_page/services/schema';
import useCustomQuery from '@app/hooks/useCustomQuery';
import Views from '@app/_modules/cms_page/_view';

const CmsPageController = props => {
  if (!modules.cms_page.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const route = useRoute();
  const [webViewKey, setWebViewKey] = useState(0);
  const params = route?.params;
  let title = params?.title ?? '';
  const type = params?.type;
  const identifier = params?.identifier ?? '';
  const isPageBuilder = params?.isPageBuilder ?? false;
  const tagsStyles = params?.tagsStyles;
  const classesStyles = params?.classesStyles;
  const useWebview = params?.useWebview ?? false;
  let loading = false;
  let content = null;

  if (type === TYPE_BLOCK) {
    const getDataCmsBlock = useCustomQuery({
      schema: GET_CMS_BLOCK,
      useInitData: true,
      variables: {identifier},
      opts: {context: {method: 'POST'}},
    });
    loading = getDataCmsBlock?.loading;
    content = getDataCmsBlock?.data?.data?.cmsBlocks?.items[0]?.content;
  } else {
    const getDataCmsPage = useCustomQuery({
      schema: GET_CMS_PAGE,
      useInitData: true,
      variables: {identifier},
      opts: {context: {method: 'POST'}},
    });
    loading = getDataCmsPage?.loading;
    content = getDataCmsPage?.data?.data?.cmsPage?.content;
    title = getDataCmsPage?.data?.data?.cmsPage?.title ?? title;
  }

  if (content) {
    switch (identifier) {
      case 'faqs':
        // remove <ul> and </ul> tags
        content = content.replace(/&lt;ul&gt;/g, '');
        content = content.replace(/&lt;\/ul&gt;/g, '');
        content = content.replace(/&lt;/g, '<');
        content = content.replace(/&gt;/g, '>');
        break;
      default:
        break;
    }
  }

  /**
   * ----------------------------------------- *
   * @function onPressCart
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  /**
   * ----------------------------------------- *
   * @function onWebviewNavigationStateChange
   * @summary put some action after webview state change
   * ----------------------------------------- *
   */
  const onWebviewNavigationStateChange = webViewState => {
    const url = webViewState.url;
    const isBlank = url.startsWith('about:blank');
    const isWhatsAppUrl = url.startsWith(PREFIX_API_WHATSAPP);
    if (!isBlank && isWhatsAppUrl) {
      Linking.openURL(url);
      const newKey = webViewKey + 1;
      setWebViewKey(newKey);
      return;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @constant {controllerProps}
   * @summary set controller props
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    t,
    useWebview,
    webViewKey,
    loading,
    content,
    title,
    isPageBuilder,
    tagsStyles,
    classesStyles,
    onPressCart,
    onWebviewNavigationStateChange,
  };

  return <Views {...props} {...controllerProps} />;
};

export default CmsPageController;
