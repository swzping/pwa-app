import React from 'react';
import {ActivityIndicator} from 'react-native-paper';

import FastImage from '@d11/react-native-fast-image';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import styles from '@app/_modules/cart/atoms/CartItemsBlock/styles';
import _ from 'lodash';

const CartItem = ({item, index}) => {
  const url = _.get(item, 'product.url_key');
  const image = _.get(item, 'product.small_image.url');
  const name = _.get(item, 'product.name');
  const quantity = _.get(item, 'quantity');
  const price = _.get(
    item,
    'product.price_range.maximum_price.final_price.value',
  );
  return (
    <CustomView
      style={
        index === 0
          ? styles.cartItemContainerNoBorderTop
          : styles.cartItemContainer
      }>
      <CustomView style={styles.itemWrapper}>
        {image === '' ? (
          <CustomView flex height={50} width={50} />
        ) : (
          <FastImage
            key={url}
            style={styles.itemImages}
            source={{
              uri: image,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
      </CustomView>
      <CustomView style={styles.itemDetails}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemQty}>Qty : {quantity}</Text>
        <Text alignStart style={styles.itemPrice}>
          IDR
          {price}
        </Text>
      </CustomView>
    </CustomView>
  );
};

const CartItemsBlock = ({items}) => {
  if (items && items.length > 0) {
    return (
      <CustomView style={styles.cartItemWrapper}>
        <CustomView style={styles.cartItemTitle}>
          <Text style={{fontSize: 14, fontWeight: '500'}}>Items</Text>
          <Text style={{fontSize: 12, fontWeight: '500'}}>
            {items.length} items
          </Text>
        </CustomView>
        <CustomView style={styles.cartItemContent}>
          {items &&
            items.map((item, index) => (
              <CartItem key={item.id} index={index} item={item} />
            ))}
        </CustomView>
      </CustomView>
    );
  } else {
    return <ActivityIndicator />;
  }
};

export default CartItemsBlock;
