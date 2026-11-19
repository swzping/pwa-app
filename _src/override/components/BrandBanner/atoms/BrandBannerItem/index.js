import React, {useState, useEffect} from 'react';
import FastImage from '@d11/react-native-fast-image';
import {Mixins} from '@app/styles/index';
import {GET_CATEGORYID_BYURL} from '@app/services/queries/banner';
import {CATEGORY, ONLY_ON_GUARDIAN} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

import useCustomQuery from '@app/hooks/useCustomQuery';
import CustomView from '@app/components/CustomView';

const BrandBannerItem = ({item}) => {
  let url = null;
  if (item.url_redirection) {
    url = item.url_redirection;
    url = url.replace('.html', '');
  }

  const [category, setCategory] = useState(null);
  const {data} = useCustomQuery({
    schema: GET_CATEGORYID_BYURL,
    useInitData: true,
    variables: {url},
  });

  useEffect(() => {
    if (data && data?.data?.categoryList?.length > 0) {
      setCategory(data?.data.categoryList[0]);
    }
  }, [data]);

  const onPress = () => {
    if (category?.id) {
      navigateTo(modules.product_list.enable, modules.product_list.name, {
        type: CATEGORY,
        categoryId: category?.id,
        categoryName:
          category?.url_path === CATEGORY ? ONLY_ON_GUARDIAN : category?.name,
      });
    }
    return;
  };

  return (
    <CustomView
      width={Mixins.MAX_WIDTH}
      height={250}
      onPress={onPress}
      style={{
        paddingVertical: 5,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FastImage
        style={{
          width: Mixins.MAX_WIDTH,
          height: undefined,
          aspectRatio: 1,
        }}
        resizeMode={FastImage.resizeMode.contain}
        source={{
          uri: item.uri,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
      />
    </CustomView>
  );
};

export default BrandBannerItem;
