import React, {useState, useRef, useCallback} from 'react';
import {RefreshControl, View, Text, ScrollView} from 'react-native';
import throttle from 'lodash.throttle';
import {TYPE_SHIMMER_CMS_HOME} from '@app/helpers/Constants';
import styles from './styles';
import NavBar from '@app/components/NavBar';
import CmsRender from '@app/components/Cms/index';
import RenderIf from '@app/components/RenderIf';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
const GuardianRun = ({
  t,
  loading,
  refreshing,
  cmsPage,
  cmsPageError,
  onRefreshCmsPage,
}) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const throttledScroll = useRef(
    throttle((y, prev) => {
      const next = y > 300;
      if (prev !== next) {
        setShowBackToTop(next);
      }
    }, 200),
  ).current;

  const handleScroll = useCallback(
    event => {
      const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;
      throttledScroll(offsetY, showBackToTop);
    },
    [showBackToTop, throttledScroll],
  );

  return (
    <ScrollView style={[styles.container]}>
      <NavBar center useWhite useBack titleBold title={'Guardian Run'} />
      <RenderIf condition={cmsPageError}>
        <View style={styles.internalServerErrorText}>
          <Text>Internal server error</Text>
        </View>
      </RenderIf>
      <RenderIf condition={loading}>
        <ShimmerSkeleton type={TYPE_SHIMMER_CMS_HOME} />
      </RenderIf>
      <RenderIf condition={!loading}>
        <CmsRender
          isHome={false}
          htmlStr={cmsPage}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefreshCmsPage}
            />
          }
          onScroll={handleScroll}
          contentContainerStyle={{}}
        />
      </RenderIf>
    </ScrollView>
  );
};

export default GuardianRun;
