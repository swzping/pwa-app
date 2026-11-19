import React from 'react';
import {TouchableRipple, Text} from 'react-native-paper';
import {Image} from 'react-native';
import {numberFormat, shortenText} from '@app/helpers/General';

import RenderIf from '@app/components/RenderIf';
import FastImage from '@d11/react-native-fast-image';
import PropTypes from 'prop-types';
import CustomView from '@app/components/CustomView';

import styles from '@app/components/_ProductItem/styles';

const ProductItem = ({keyImage, image, name, currency, price, onPress}) => {
  const imageSourceCondition = image !== '';
  return (
    <TouchableRipple
      key={keyImage}
      onPress={onPress}
      style={styles.frameProductItem}>
      <CustomView>
        <RenderIf condition={imageSourceCondition}>
          <FastImage
            key={keyImage}
            style={styles.itemImage}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri: image.toString(),
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
          />
        </RenderIf>
        <RenderIf condition={!imageSourceCondition}>
          <Image
            source={require('@app/assets/images/placeholder.png')}
            style={styles.itemImage}
          />
        </RenderIf>
        <Text style={styles.productItemName}>{shortenText(name, 35)}</Text>
        <Text style={styles.productItemPrice}>
          {numberFormat(currency, price.toFixed(2))}
        </Text>
      </CustomView>
    </TouchableRipple>
  );
};

ProductItem.propTypes = {
  // @summary image url of product
  image: PropTypes.string.isRequired,
  // @summary name of product
  name: PropTypes.string.isRequired,
  // @summary price of product
  price: PropTypes.number,
};

export default ProductItem;
