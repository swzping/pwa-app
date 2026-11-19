import React, {useEffect, useRef, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import NavBar from '@app/components/NavBar';
import {RefreshControl, ScrollView} from 'react-native';
import {modules} from '@root/swift.config';
import {useTheme} from 'react-native-paper';
import RenderIf from '@app/components/RenderIf';
import {useRoute} from '@react-navigation/native';
import {GET_CMS_PAGE} from '@app/services/queries/cms';
import {SafeAreaView} from 'react-native-safe-area-context';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart';
import PageBuilder from '@app/components/PageBuilder';
import _ from 'lodash';
import {navigateTo} from '@app/helpers/Navigation';
import styles from '@app/_modules/main_home/styles';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import {TYPE_SHIMMER_CMS_PAGE} from '@app/helpers/Constants';
const SubCMSPage = props => {
  // const {t} = useTranslation();
  const route = useRoute();
  const params = route?.params;
  const identifier = params?.identifier ?? '';
  const mount = useRef();

  const [cmsPage, setCmsPage] = useState([]);
  const [title, setTitle] = useState([]);

  const {
    data: cmsPageData,
    onRefetchData: onReloadCmsPage,
    loading,
  } = useCustomQuery({
    schema: GET_CMS_PAGE,
    useInitData: true,
    variables: {
      identifier,
    },
    opts: {fetchPolicy: 'no-cache'},
  });

  const theme = useTheme();
  const {background} = _.get(theme, 'colors');

  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
    };
  }, []);

  useEffect(() => {
    if (mount.current && cmsPageData && cmsPageData?.data) {
      setCmsPage(cmsPageData?.data.cmsPage.app_content);
      setTitle(cmsPageData?.data.cmsPage.title);
    }
  }, [cmsPageData]);

  const onRefreshCmsPage = () => {
    onReloadCmsPage({params: {identifier: {identifier}}});
  };

  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  return (
    <SafeAreaView style={{backgroundColor: background, flex: 1}}>
      <NavBar
        useWhite
        useBack
        useShadow={false}
        title={title}
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />
      <ScrollView
        overScrollMode="never"
        // ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        // onScroll={onScroll}
        contentContainerStyle={styles.containerScroll}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefreshCmsPage} />
        }>
        <RenderIf condition={loading}>
          <ShimmerSkeleton type={TYPE_SHIMMER_CMS_PAGE} />
        </RenderIf>
        <RenderIf condition={!loading}>
          <PageBuilder htmlBlock={cmsPage} />
        </RenderIf>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubCMSPage;
