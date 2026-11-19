import React from 'react';
import {FlatList} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {numberFormat} from '@app/helpers/General';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {modules} from '@root/swift.config';

import ToggleWishlist from '@app/components/ToggleWishlist';
import Button from '@app/components/Button/index';
import NavBar from '@app/components/NavBar';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import CustomInputQty from '@app/_modules/cart/atoms/CustomInputQty/index';
import FastImage from '@d11/react-native-fast-image';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import ButtonRemoveItemFromCart from '@app/_modules/cart/atoms/ButtonRemoveItemFromCart';
import ModalUpdateCartItem from '@app/_modules/cart/atoms/ModalUpdateCartItem';

import styles from '@app/_modules/cart/styles';
import _ from 'lodash';

export const WishListButton = props => {
  return <ToggleWishlist {...props} />;
};

function CartScreen({
  cartItems,
  cartPrices,
  onNavigateToProductDetail,
  onNavigateToShipping,
  userType,
}) {
  /**
   * ----------------------------------------- *
   * @function onRenderItem
   * @summary render cart item list
   * @return Component cart item
   * ----------------------------------------- *
   */
  const onRenderItem = ({item}) => {
    const url = _.get(item, 'product.url_key');
    const image = _.get(item, 'product.small_image.url');
    const name = _.get(item, 'product.name');
    const quantity = _.get(item, 'quantity');
    const price = _.get(
      item,
      'product.price_range.maximum_price.final_price.value',
    );
    const id = _.get(item, 'id');
    const productID = _.get(item, 'product.id');
    const wishlistID = _.get(item, 'wishlistId');
    const sku = _.get(item, 'sku');

    function isEQ(prevProps, nextProps) {
      return prevProps.initialQuantity === nextProps.initialQuantity;
    }

    const InputQty = React.memo(CustomInputQty, isEQ);
    return (
      <CustomView
        flex
        row
        width={Mixins.MAX_WIDTH}
        horizontalCenter
        verticalCenter
        paddingHorizontal={20}
        marginVertical={5}
        style={styles.cartItemContainer}>
        <CustomView
          horizontalStart
          width={Mixins.MAX_WIDTH * 0.35}
          paddingVertical={10}
          onPress={() => onNavigateToProductDetail(item.url_key)}>
          {image ? (
            <FastImage
              key={url}
              style={styles.cartItemImage}
              source={{
                uri: image,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <CustomView
              width={Mixins.MAX_WIDTH * 0.3}
              height={150}
              backgroundColor={Colors.GRAY_LIGHT}
            />
          )}
        </CustomView>
        <CustomView horizontalStart verticalCenter flexNumber={3}>
          <Text style={styles.cartItemDetailText}>{name}</Text>
          <Text style={styles.cartItemDetailText}>Qty: {quantity}</Text>
          <Text bold style={[styles.cartItemDetailText]}>
            {numberFormat('IDR', price)}
          </Text>

          <CustomView
            row
            spaceBetween
            horizontalCenter
            width={100}
            marginVertical={15}>
            {userType === 'customer' && (
              <WishListButton
                item={item}
                productId={productID}
                wishlistItemId={wishlistID}
                productName={name}
                productSku={sku}
                productPrice={price}
                productCurrency={'IDR'}
                styleProp={styles.wishlistIcon}
                iconSize={normalize(15)}
              />
            )}

            {modules.cart.atoms.update_item_qty_modal.enable && (
              <ModalUpdateCartItem
                name={name}
                cartItemId={id}
                initialQuantity={quantity}
                propStyle={styles.cartItemActionIcon}>
                <SimpleLineIcons name="pencil" size={normalize(15)} />
              </ModalUpdateCartItem>
            )}

            {modules.cart.atoms.update_item_qty_input.enable && (
              <InputQty
                initialQuantity={quantity}
                cartItemId={id}
                item={item}
              />
            )}
            <ButtonRemoveItemFromCart
              item={item}
              cartItemId={id}
              propStyle={styles.cartItemActionIcon}
              product={{
                currency:
                  item.price_range === undefined
                    ? item.currency
                    : item.price_range.maximum_price.final_price.currency,
                price:
                  item.price_range === undefined
                    ? item.price * item.quantity
                    : item.price_range.maximum_price.final_price.value *
                      item.quantity,
                id: item.productId,
                name: item.name,
                sku: item.sku,
              }}>
              <SimpleLineIcons name="trash" size={normalize(15)} />
            </ButtonRemoveItemFromCart>
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };

  /**
   * ----------------------------------------- *
   * @component SubTotal
   * @profiler {Sentry}
   * @summary Text Component for display price
   * @returns Components
   * ----------------------------------------- *
   */
  const SubTotal = () => {
    const price = _.get(cartPrices, 'subtotal_excluding_tax.value');
    const currency = _.get(cartPrices, 'subtotal_excluding_tax.currency');
    return (
      <CustomView
        horizontalCenter
        verticalCenter
        // flex
        width={Mixins.MAX_WIDTH * 0.5}
        height={50}
        style={styles.subTotalSubContainer}>
        <Text bold primary>
          {price && typeof price === 'number'
            ? `Subtotal ${'\n'}${numberFormat(currency, price)}`
            : 'Loading'}
        </Text>
      </CustomView>
    );
  };

  return (
    <CustomView flex width={Mixins.MAX_WIDTH}>
      <NavBar title="Cart" />
      <FlatList
        style={styles.listContainer}
        data={cartItems}
        renderItem={onRenderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          cartItems === undefined || cartItems === null ? (
            <ActivityIndicator />
          ) : (
            <Text center>No Data</Text>
          )
        }
      />
      <CustomView style={{flexDirection: 'row'}} width={Mixins.MAX_WIDTH}>
        <SubTotal />
        <Button
          disabled={!cartItems?.length}
          onPress={onNavigateToShipping}
          label="Checkout"
          width={Mixins.MAX_WIDTH * 0.5}
          textStyleProp={styles.checkOutButtonText}
          loading={cartItems === undefined || cartItems === null}
          styleProp={[
            styles.checkOutButtonContainer,
            !cartItems?.length && {backgroundColor: Colors.GRAY_DARK},
          ]}
        />
      </CustomView>
    </CustomView>
  );
}

export default CartScreen;
