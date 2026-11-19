import React, {useEffect, useState} from 'react';
import {GET_CATEGORYID_BYURL} from '@app/services/queries/banner';
import {CATEGORY} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

import useCustomQuery from '@app/hooks/useCustomQuery';
import BannerItem from '@app/components/BannerSlider/atoms/_BannerItem/index';

const BannerSliderImage = ({clickable, item, index}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant for
   * this function
   * ----------------------------------------- *
   */
  const noImageSource = require('@app/assets/images/placeholder.png');
  const splitUrlArray = item.url_redirection.split('/');
  const url = splitUrlArray[splitUrlArray.length - 1];
  const [, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);
  const {data: categoryIdData} = useCustomQuery({
    schema: GET_CATEGORYID_BYURL,
    useInitData: true,
    variables: {url},
  });

  /**
   * ----------------------------------------- *
   * @dependency [categoryIdData]
   * @summary onvert url to id
   * category id data change
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (categoryIdData?.data) {
      setCategoryId(categoryIdData?.data.categoryList[0]?.id);
    }
  }, [categoryIdData]);

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
  const onPress = () => {
    if (!clickable) {
      return;
    }
    navigateTo(modules.product_list.enable, modules.product_list.name, {
      variables: {
        type: CATEGORY,
        categoryId: categoryId,
      },
    });
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
      onPress={onPress}
      onError={_onImageBannerError}
      onLoadEnd={_onImageBannerLoadEnd}
    />
  );
};

export default BannerSliderImage;
