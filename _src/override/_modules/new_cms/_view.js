import React, {useRef, useCallback, useState, useMemo} from 'react';
import {ScrollView, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';
import _ from 'lodash';
import NavBar from '@app/components/NavBar';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/index';
import RenderIf from '@app/components/RenderIf';
import CmsRender from '@app/components/Cms';
import RenderHTML from '@app/components/RenderHTML';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import {TYPE_SHIMMER_CMS_PAGE} from '@app/helpers/Constants';
import Text from '@app/components/Text';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import styles from './styles';

const NewCmsView = ({
  t,
  title,
  content,
  loading,
  error,
  tagsStyles,
  classesStyles,
  onRefresh,
}) => {
  const theme = useTheme();
  const {background} = _.get(theme, 'colors');
  const scrollRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  // Page Builder JSON 应该总是有效的 JSON
  const isPageBuilder = useMemo(() => {
    if (!content) {
      return false;
    }
    try {
      const parsed = JSON.parse(content);
      const isValid = parsed?.contentType === 'root-container';
      return isValid;
    } catch (e) {
      return false;
    }
  }, [content]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  );

  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  // Loading state
  if (loading && !content) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
        <NavBar
          useWhite
          useBack
          title={title}
          childrenRight={<AtomRightCart onPressCart={onPressCart} />}
        />
        <ScrollView>
          <ShimmerSkeleton type={TYPE_SHIMMER_CMS_PAGE} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
        <NavBar
          useWhite
          useBack
          title={title}
          childrenRight={<AtomRightCart onPressCart={onPressCart} />}
        />
        <ScrollView
          refreshControl={refreshControl}
          contentContainerStyle={styles.stateContainer}>
          <Text style={styles.stateTitle}>{t('common:error')}</Text>
          <Text style={styles.stateSubtitle}>
            {error?.message || t('common:somethingWrong')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!loading && !content) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
        <NavBar
          useWhite
          useBack
          title={title}
          childrenRight={<AtomRightCart onPressCart={onPressCart} />}
        />
        <ScrollView
          refreshControl={refreshControl}
          contentContainerStyle={styles.stateContainer}>
          <Text style={styles.stateTitle}>{t('cms_page.pageNotFound')}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      <NavBar
        useWhite
        useBack
        title={title}
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />

      <RenderIf condition={isPageBuilder}>
        <CmsRender
          ref={scrollRef}
          htmlStr={content}
          refreshControl={refreshControl}
          contentContainerStyle={styles.cmsContentContainer}
          tagsStyles={tagsStyles}
          classesStyles={classesStyles}
        />
      </RenderIf>

      <RenderIf condition={!isPageBuilder}>
        <ScrollView
          ref={scrollRef}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={styles.htmlContentContainer}>
          <RenderHTML
            htmlBlock={content}
            tagsStyles={tagsStyles}
            classesStyles={classesStyles}
          />
        </ScrollView>
      </RenderIf>
    </SafeAreaView>
  );
};

export default NewCmsView;
