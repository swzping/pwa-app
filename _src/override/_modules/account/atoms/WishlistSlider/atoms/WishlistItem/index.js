import React, {useState} from 'react';
import {Image} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {thumborProductList} from '@app/helpers/Thumbor';
import {numberFormat} from '@app/helpers/General';
import {Colors, Mixins} from '@app/styles';
import styles from '@app/_modules/account/atoms/WishlistSlider/atoms/WishlistItem/styles';

import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import ButtonAddToCart from '@app/components/ButtonAddToCart';

const WishlistItem = ({
  t,
  item,
  onRemoveFromWishlist,
  onNavigateToProductDetail,
  index,
}) => {
  const [imageErrors, setImageErrors] = useState({});

  const price_range = item?.price_range;
  const price_max = price_range?.maximum_price;
  const price_final = price_max?.final_price || price_max?.regular_price;

  let imageSourceCondition =
    item.image !== null && item.image !== '' && item.image !== undefined;
  if (imageErrors[item.url_key]) {
    imageSourceCondition = false;
  }

  return (
    <CustomView horizontalCenter paddingVertical={5}>
      <CustomView
        horizontalCenter
        key={index}
        style={styles.itemContainer}
        onPress={() =>
          onNavigateToProductDetail({
            productUrlKey: item.url_key,
            productSku: item.sku,
          })
        }>
        <RenderIf condition={imageSourceCondition}>
          <FastImage
            key={item.url_key}
            style={styles.itemImage}
            source={{
              uri: thumborProductList(item?.image?.toString()),
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.contain}
            onError={() => {
              const newImageErrors = {
                ...imageErrors,
                [item.url_key]: true,
              };
              setImageErrors(newImageErrors);
            }}
          />
        </RenderIf>
        <RenderIf condition={!imageSourceCondition}>
          <Image
            source={require('@app/assets/images/placeholder.png')}
            style={styles.itemImage}
          />
        </RenderIf>
        <CustomView horizontalStart width={'100%'}>
          <Text left style={{marginVertical: 10}}>
            {item.name}
          </Text>
          <Text bold color={Colors.PRIMARY}>
            {numberFormat(
              price_final?.currency,
              item.special_price || price_final?.value,
              ',',
              2,
            )}
          </Text>
        </CustomView>
      </CustomView>
      <CustomView style={{width: Mixins.MAX_WIDTH * 0.6}}>
        <ButtonAddToCart
          item={item}
          type={item.__typename}
          isWishlistSlider={true}
        />
      </CustomView>
      <CustomView onPress={() => onRemoveFromWishlist(item)}>
        <CustomView row>
          <Icon
            name={'delete'}
            color={Colors.GRAY_MEDIUM}
            size={20}
            style={{marginRight: 5}}
          />
          <Text underline color={Colors.PRIMARY}>
            {t('account.label.remove')}
          </Text>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default WishlistItem;
