import React from 'react';
import {Mixins} from '@app/styles';
import {Colors} from '@app/styles/index';
import FastImage from '@d11/react-native-fast-image';
import CustomView from '@app/components/CustomView/index';
import {navigateUrlToPage} from '@app/helpers/Navigation';
import {rxAppLoading} from '@app/services/cache';
import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import {useLazyQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';

const WidgetBannerImage = ({data}) => {
  const {t} = useTranslation();
  const [onGetResolver] = useLazyQuery(URL_RESOLVER, {fetchPolicy: 'no-cache'});

  const onPressImage = async () => {
    rxAppLoading(true);
    const res = await onGetResolver({
      variables: {url: data.link},
    });
    rxAppLoading(false);

    const fullUrl = data.link;
    const type = res?.data?.urlResolver?.type;
    const id = res?.data?.urlResolver?.id;
    const url_key = res?.data?.urlResolver?.relative_url?.replace('.html', '');

    navigateUrlToPage({t, fullUrl, type, id, url_key});
  };

  const imageProps = {
    resizeMode: FastImage.resizeMode.cover,
    style: {
      alignSelf: 'center',
      marginHorizontal: 10,
      width: Mixins.MAIN_BANNER_WIDTH,
      height: Mixins.MAIN_BANNER_WIDTH / 3,
      borderRadius: 12,
    },
    source: {
      uri: data.images.mobile_image,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    },
  };
  return (
    <CustomView
      backgroundColor={Colors.WHITE}
      onPress={onPressImage}
      style={{top: -3}}>
      <FastImage {...imageProps} />
    </CustomView>
  );
};

export default WidgetBannerImage;
