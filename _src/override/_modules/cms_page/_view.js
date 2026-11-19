import React from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from 'react-native-paper';

import _ from 'lodash';

import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/index';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton/index';
import CustomView from '@app/components/CustomView/index';
import NavBar from '@app/components/NavBar';
import PageBuilder from '@app/components/PageBuilder/index';
import RenderHTML from '@app/components/RenderHTML/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text/index';
import { TYPE_SHIMMER_CMS_PAGE } from '@app/helpers/Constants';
import { Mixins } from '@app/styles';

/**
 * ---------------------------------------------------- *
 * @component AuthSigningView
 * @param {Object} Views.propTypes - defined using PropTypes
 * @summary View Component for Sign In
 * @returns Components
 * ---------------------------------------------------- *
 */
const Views = ({
  t,
  title,
  useWebview,
  webViewKey,
  loading,
  content,
  isPageBuilder,
  tagsStyles,
  classesStyles,
  onPressCart,
  onWebviewNavigationStateChange,
}) => {
  const theme = useTheme();
  const { background } = _.get(theme, 'colors');

  // for notification & deeplink
  if (useWebview) {
    if (loading) {
      return (
        <View style={{ flex: 1 }}>
          <NavBar useWhite useBack title={''} />
          <ScrollView>
            <ShimmerSkeleton type={TYPE_SHIMMER_CMS_PAGE} />
          </ScrollView>
        </View>
      );
    }

    // not found identifier in magento
    if (!loading && !content) {
      return (
        <View style={{ flex: 1 }}>
          <NavBar useWhite useBack title={''} />
          <CustomView
            horizontalCenter
            verticalCenter
            marginTop={0.4 * Mixins.MAX_HEIGHT}>
            <Text>{t('cms_page.pageNotFound')}</Text>
          </CustomView>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <NavBar useWhite useBack title={title} />
        <RenderHTML
          useWebview
          webViewKey={webViewKey}
          htmlBlock={content}
          tagsStyles={tagsStyles}
          classesStyles={classesStyles}
          onWebviewNavigationStateChange={onWebviewNavigationStateChange}
        />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: background, flex: 1 }}>
      <NavBar
        useWhite
        useBack
        title={title}
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />
      <ScrollView>
        <RenderIf condition={loading}>
          <ShimmerSkeleton type={TYPE_SHIMMER_CMS_PAGE} />
        </RenderIf>
        <RenderIf condition={!loading}>
          <RenderIf condition={isPageBuilder}>
            <PageBuilder htmlBlock={content} />
          </RenderIf>
          <RenderIf condition={!isPageBuilder}>
            <RenderHTML
              webViewKey={webViewKey}
              htmlBlock={content}
              tagsStyles={tagsStyles}
              classesStyles={classesStyles}
              onWebviewNavigationStateChange={onWebviewNavigationStateChange}
            />
          </RenderIf>
        </RenderIf>
      </ScrollView>
    </View>
  );
};

export default Views;
