import React, {useState} from 'react';
import {navigateUrlToPage} from '@app/helpers/Navigation';
import {useTranslation} from 'react-i18next';
import {rxAppLoading} from '@app/services/cache';
import BannerItem from '@app/components/BannerSlider/atoms/_BannerItem/index';
import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import {useLazyQuery} from '@apollo/client';

const BannerSliderImage = ({clickable, item, index, section}) => {
  const {t} = useTranslation();
  const noImageSource = require('@app/assets/images/placeholder.png');
  const [, setLoading] = useState(true);
  const [onGetResolver] = useLazyQuery(URL_RESOLVER, {fetchPolicy: 'no-cache'});

  /**
   * ----------------------------------------- *
   * @function _onImageBannerLoadEnd
   * @summary stop loading when load end
   * ----------------------------------------- *
   */
  const _onImageBannerLoadEnd = () => {
    setLoading(false);
  };

  /**
   * ----------------------------------------- *
   * @function _onImageBannerError
   * @summary stop loading when banner error
   * ----------------------------------------- *
   */
  const _onImageBannerError = () => {
    setLoading(false);
  };

  /**
   * ----------------------------------------- *
   * @condition
   * @summary handle broken image
   * ----------------------------------------- *
   */
  const image_url = item.image_url;
  const imageSource =
    image_url !== null || image_url !== undefined || image_url !== ''
      ? image_url
      : noImageSource;

  /**
   * ----------------------------------------- *
   * @function onPress
   * @summary handle onPress BannerItem
   * ----------------------------------------- *
   */
  const onPress = async () => {
    if (!clickable) {
      return;
    } else {
      rxAppLoading(true);
      const res = await onGetResolver({
        variables: {url: item.url_redirection},
      });
      rxAppLoading(false);

      const fullUrl = item.url_redirection;
      const type = res?.data?.urlResolver?.type;
      const id = res?.data?.urlResolver?.id;
      const url_key = res?.data?.urlResolver?.relative_url?.replace(
        '.html',
        '',
      );

      navigateUrlToPage({t, fullUrl, type, id, url_key});
    }
  };

  /**
   * ----------------------------------------- *
   * @condition
   * @summary type of image
   * ----------------------------------------- *
   */
  return (
    <BannerItem
      key={'banner-item-' + index}
      clickable
      keyIndex={item.image_id}
      imageSource={imageSource}
      section={section}
      onPress={onPress}
      onError={_onImageBannerError}
      onLoadEnd={_onImageBannerLoadEnd}
    />
  );
};

export default BannerSliderImage;
