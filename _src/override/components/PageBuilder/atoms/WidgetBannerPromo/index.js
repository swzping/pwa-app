import React from 'react';
import FastImage from '@d11/react-native-fast-image';
import {navigateUrlToPage} from '@app/helpers/Navigation';
import {Colors} from '@app/styles/index';
import {normalize} from '@app/styles/mixins.new';
import CustomView from '@app/components/CustomView/index';
import TwoSlidesCarousel from '@app/components/TwoSlidesCarousel/index';
import {rxAppLoading} from '@app/services/cache';
import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import {useLazyQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';

const WidgetBannerPromo = ({data, slideIntervalTime = 5000}) => {
  const {t} = useTranslation();
  const [onGetResolver] = useLazyQuery(URL_RESOLVER, {fetchPolicy: 'no-cache'});

  const onNavigateToPage = async item => {
    rxAppLoading(true);
    const res = await onGetResolver({
      variables: {url: item.url_redirection},
    });
    rxAppLoading(false);

    const fullUrl = item.url_redirection;
    const type = res?.data?.urlResolver?.type;
    const id = res?.data?.urlResolver?.id;
    const url_key = res?.data?.urlResolver?.relative_url?.replace('.html', '');

    navigateUrlToPage({t, fullUrl, type, id, url_key});
  };

  const renderItemBannerPromo = ({item}) => {
    const imageProps = {
      // resizeMode: FastImage.resizeMode.contain,
      resizeMode: FastImage.resizeMode.cover,
      style: {
        alignSelf: 'center',
        width: '100%',
        height: normalize(130),
        borderRadius: 12,
      },
      source: {
        uri: item.image_url,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      },
    };
    return (
      <CustomView
        backgroundColor={Colors.TRANSPARENT}
        onPress={() => onNavigateToPage(item)}
        paddingHorizontal={5}>
        <FastImage {...imageProps} />
      </CustomView>
    );
  };

  return (
    <CustomView
      paddingVertical={20}
      backgroundColor={Colors.TRANSPARENT}
      style={{top: -3}}>
      <TwoSlidesCarousel
        key={'node-3'}
        data={data}
        slideIntervalTime={slideIntervalTime}
        navigatorButtonHeight={50}
        renderItem={renderItemBannerPromo}
      />
    </CustomView>
  );
};

export default WidgetBannerPromo;
