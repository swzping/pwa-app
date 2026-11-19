import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import RenderIf from '@root/_src/core/components/RenderIf';

import CheckBox from '@app/_modules/product_list/atoms/Checkbox';
import CustomView from '@app/components/CustomView';
import {Colors} from '@app/styles';

import QtyStepper from './QtyStepper';

function ProductItem({
  t,
  item = {},
  selected,
  initialQty,
  maxQty,
  minQty = 0,
  onChangeCheckBox,
  onChangeQuantity,
}) {
  const imageSource = item.image_url
    ? {uri: item.image_url}
    : require('@app/assets/images/placeholder.png');

  return (
    <CustomView
      row
      marginTop={24}
      paddingBottom={20}
      borderColor={Colors.GRAY_MEDIUM}
      style={styles.productItem}>
      <CheckBox
        uncheckedColor={'#969696'}
        checkedColor={Colors.PRIMARY}
        onPress={() => onChangeCheckBox && onChangeCheckBox(!selected)}
        checkedSize={18}
        size={20}
        radius={4}
        selected={selected}
        style={styles.checkbox}
      />
      <CustomView flex={1}>
        {/* Without promo, show the qty */}
        <RenderIf condition={!item.promo_id}>
          <CustomView flex={1} row style={styles.productRow}>
            <Image style={styles.productImage} source={imageSource} />
            <CustomView flex={1}>
              <Text style={styles.productName}>
                {item.name ?? 'DARLIE Toothpaste Double Action 225g'}
              </Text>
              <CustomView row spaceBetween>
                <Text style={styles.productPrice}>{item.price}</Text>
                <Text style={styles.productQty}>x{item.qty}</Text>
              </CustomView>
              {/* Qty */}
              <QtyStepper
                initialValue={initialQty}
                maxQty={maxQty}
                minQty={minQty}
                onChangeQuantity={onChangeQuantity}
              />
              <CustomView row horizontalCenter spaceBetween marginTop={12}>
                <Text style={styles.estRefundLabel}>Est. Refund</Text>
                <Text style={styles.estRefundAmount}>
                  {item.estRefund}
                </Text>
              </CustomView>
            </CustomView>
          </CustomView>
        </RenderIf>
        {/* Discount product / free item / GWP product, customer can only return the whole product */}
        <RenderIf condition={item.promo_id}>
          <CustomView flex={1} row style={styles.productRow}>
            <Image style={styles.productImage} source={imageSource} />
            <CustomView flex={1}>
              <Text style={styles.productName}>
                {item.name ?? 'DARLIE Toothpaste Double Action 225g'}
              </Text>
              <CustomView row spaceBetween>
                <Text style={styles.productPrice}>{item.price}</Text>
                <Text style={styles.productQty}>x{item.qty}</Text>
              </CustomView>
              <View style={styles.fullReturnBadge}>
                <Text style={styles.fullReturnBadgeText}>Full return only</Text>
              </View>
              <CustomView row horizontalCenter spaceBetween marginTop={12}>
                <Text style={styles.estRefundLabel}>Est. Refund</Text>
                <Text style={styles.estRefundAmount}>
                  {item.estRefund ?? 'Rp46.500'}
                </Text>
              </CustomView>
            </CustomView>
          </CustomView>
          {item.freeItems?.map(freeItem => (
            <CustomView
              key={`${item.id}-${freeItem.id}`}
              flex={1}
              row
              style={styles.freeItemRow}>
              <Image style={styles.productImage} source={imageSource} />
              <CustomView flex={1}>
                <Text style={styles.productName}>
                  {freeItem.name ?? 'DARLIE Toothpaste Double Action 225g'}
                </Text>
                <CustomView row spaceBetween>
                  <Text style={styles.productPrice}>Free Item</Text>
                  <Text style={styles.productQty}>x{freeItem.qty}</Text>
                </CustomView>
                <CustomView row horizontalCenter spaceBetween marginTop={12}>
                  <Text style={styles.estRefundLabel}>Est. Refund</Text>
                  <Text style={styles.estRefundAmount}>Rp0</Text>
                </CustomView>
              </CustomView>
            </CustomView>
          ))}
        </RenderIf>
      </CustomView>
    </CustomView>
  );
}

export default ProductItem;

const styles = StyleSheet.create({
  /* --- Product item container --- */
  productItem: {
    gap: 20,
  },
  checkbox: {
    borderWidth: 1.5,
  },
  productRow: {
    gap: 20,
  },
  freeItemRow: {
    gap: 20,
    marginTop: 24,
  },
  /* --- Product info --- */
  productImage: {
    width: 100,
    height: 100,
  },
  productName: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
  productPrice: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 14,
    color: '#9e9e9e',
  },
  productQty: {
    fontWeight: '500',
    fontSize: 14,
    color: '#9e9e9e',
  },
  /* --- Full return only badge --- */
  fullReturnBadge: {
    height: 20,
    marginTop: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  fullReturnBadgeText: {
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#616161',
  },
  /* --- Est. refund --- */
  estRefundLabel: {
    fontWeight: '500',
    fontSize: 14,
    color: '#212121',
  },
  estRefundAmount: {
    fontFamily: 'Noto Sans',
    fontWeight: '700',
    fontSize: 15,
    color: '#ff8200',
  },
});
