import React from 'react';
import {FlatList} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Colors, Mixins} from '@app/styles';
import {TYPE_NUMBER} from '@app/helpers/Constants';
import Button from '@app/components/Button/index';
import NavBar from '@app/components/NavBar';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import ListCart from '@app/_modules/cart_edit/atoms/ListCart/index';
import AtomBlockSubTotal from '@app/_modules/cart_checkout/atoms/BlockSubTotal/index';
import RenderIf from '@app/components/RenderIf';
import styles from '@app/_modules/cart/styles';
import _ from 'lodash';

function CartScreen({
  t,
  cartItems,
  cartPrices,
  userWishlist,
  onNavigateToProductDetail,
  onNavigateToCheckout,
  onPressEdit,
  edit,
  expand,
  expandDiscount,
  totalDiscount,
  onPressExpand,
  onPressExpandDiscount,
  isEmptyCart,
}) {
  const cartPrice = _.get(cartPrices, 'subtotal_excluding_tax.value');
  const itemInCartNoHide = cartItems?.filter(item => !item.hide);
  const loadingChange =
    cartItems?.filter(item => item.hide).length > 0 ||
    cartItems?.filter(item => item.edit).length > 0;

  /**
   * ----------------------------------------- *
   * @function onRenderItem
   * @summary render cart item list
   * @return Component cart item
   * ----------------------------------------- *
   */
  const onRenderItem = ({item}) => {
    return (
      <CustomView>
        <ListCart
          item={item}
          onNavigateToProductDetail={onNavigateToProductDetail}
          edit={edit}
          wishlistId={
            userWishlist
              ? userWishlist.find(wish => wish.sku === item?.product?.sku)
              : null
          }
          loadingChange={loadingChange}
        />
      </CustomView>
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function ListEmptyComponent
   * @summary for list empty component
   * @returns {view}
   * ---------------------------------------------------- *
   */
  const ListEmptyComponent = () => {
    if (isEmptyCart) {
      return <ActivityIndicator />;
    }
    return <Text center>{t('noData')}</Text>;
  };

  return (
    <CustomView flex width={Mixins.MAX_WIDTH}>
      <NavBar
        center
        useClose
        useWhite
        title={t('cart.shoppingCart')}
        titleStyle={styles.navbarTitleStyle}
        stylesContainer={styles.navbarStylesContainerEdit}
      />
      <CustomView row spaceBetween>
        <Text style={{marginLeft: 20, marginTop: 15}}>
          {itemInCartNoHide.length} {t('cart.itemsInCart')}
        </Text>
        <CustomView
          onPress={loadingChange ? false : onPressEdit}
          paddingVertical={5}
          paddingHorizontal={15}
          border={1}
          borderRadius={30}
          style={{
            marginRight: 20,
            marginTop: 10,
            opacity: loadingChange ? 0.4 : 1,
          }}>
          <Text bold>{edit ? t('save') : t('edit')}</Text>
        </CustomView>
      </CustomView>
      <FlatList
        style={styles.listContainer}
        data={itemInCartNoHide}
        renderItem={onRenderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={ListEmptyComponent}
      />
      <CustomView
        horizontalCenter
        backgroundColor={Colors.WHITE}
        style={{
          flexDirection: 'column',
          opacity: itemInCartNoHide?.length && loadingChange ? 0.4 : 1,
        }}
        width={Mixins.MAX_WIDTH}>
        <AtomBlockSubTotal
          isEmptyCart={isEmptyCart}
          isCheckout={false}
          expand={expand}
          expandDiscount={expandDiscount}
          cart={cartItems}
          dataPrices={cartPrices}
          totalDiscount={totalDiscount}
          onPressExpand={onPressExpand}
          onPressExpandDiscount={onPressExpandDiscount}
        />
        <Button
          disabled={!itemInCartNoHide?.length}
          onPress={loadingChange ? false : onNavigateToCheckout}
          label="Checkout"
          width={Mixins.MAX_WIDTH * 0.9}
          textStyleProp={styles.checkOutButtonText}
          loading={cartItems === undefined || cartItems === null}
          styleProp={[
            styles.checkOutButtonContainer,
            !itemInCartNoHide?.length && {backgroundColor: Colors.GRAY_DARK},
          ]}
        />
        <CustomView
          horizontalCenter
          verticalCenter
          width={Mixins.MAX_WIDTH}
          height={30}
          style={styles.subTotalSubContainer}>
          <RenderIf condition={!cartPrice && typeof cartPrice !== TYPE_NUMBER}>
            <Text bold>{t('loading')}</Text>
          </RenderIf>
        </CustomView>
      </CustomView>
    </CustomView>
  );
}

export default CartScreen;
