/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react';
import {FlatList, Modal, SafeAreaView} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {WebView} from 'react-native-webview';
import {useReactiveVar} from '@apollo/client';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {
  rxCartPayment,
  rxCartShipping,
  rxCartBillingAddress,
  rxCartIsVirtual,
  rxUserAddresses,
  rxCartShippingAddress,
  rxUserTheme,
} from '@app/services/cache';

import styles from '@root/_src/core/_modules/cart_checkout_onestep/styles';
import Button from '@app/components/Button';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import FastImage from '@d11/react-native-fast-image';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import PaymentMethodBlock from '@app/_modules/cart/atoms/PaymentMethodBlock';
import ShippingAddressBlock from '@app/_modules/cart/atoms/ShippingAddressBlock';
import ShippingMethodBlock from '@app/_modules/cart/atoms/ShippingMethodBlock';
import ButtonRemoveItemFromCart from '@app/_modules/cart/atoms/ButtonRemoveItemFromCart';
import ModalUpdateCartItem from '@app/_modules/cart/atoms/ModalUpdateCartItem';

const STEP = {
  1: 'CART_ITEMS_STEP',
  2: 'ADDRESS_STEP',
  3: 'SHIPPING_METHOD_STEP',
  4: 'PAYMENT_STEP',
  5: 'SUMMARY_STEP',
};

function OneStepCheckoutScreen({
  t,
  navigation,
  currentStep,
  setCurrentStep,
  //
  cartItems,
  onSelectShippingAddress,
  shippingAddressLoading,
  availableShippingMethods,
  selectedShippingMethod,
  onSelectShippingMethod,
  availablePaymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onSummaryStep,
  cartPrices,
  snapUrl,
  refetchSnap,
  onPlaceOrder,
}) {
  const [showSnapModal, setShowSnapModal] = useState(false);
  const scheme = useReactiveVar(rxUserTheme);

  useEffect(() => {
    if (snapUrl) {
      setShowSnapModal(true);
    }
  }, [snapUrl]);

  const SnapWebView = ({snapUrl, showSnapModal, setShowSnapModal}) => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showSnapModal}
        onRequestClose={() => {
          setShowSnapModal(false);
          refetchSnap();
        }}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: Colors.WHITE,
          }}>
          <CustomView flex>
            <WebView
              onNavigationStateChange={webViewState => {
                if (
                  !webViewState.url.startsWith(
                    'https://app.sandbox.midtrans.com/snap/v2/vtweb/',
                  )
                ) {
                  setShowSnapModal(false);
                  refetchSnap();
                }
              }}
              source={{uri: snapUrl}}
              style={{flex: 1}}
            />
          </CustomView>
        </SafeAreaView>
      </Modal>
    );
  };

  const StepNavigationBtnBlock = ({
    nextLabel = 'Next',
    onPressNext = null,
    noBackButton = false,
  }) => {
    return (
      <CustomView
        row
        spaceAround
        paddingVertical={10}
        width={Mixins.MAX_WIDTH * 0.9}>
        <RenderIf condition={!noBackButton}>
          <Button
            width={(Mixins.MAX_WIDTH * 0.8) / 2}
            label={t('cart_checkout_onestep.label.back')}
            onPress={() => {
              setCurrentStep(currentStep - 1);
            }}
          />
        </RenderIf>
        <Button
          width={
            noBackButton ? Mixins.MAX_WIDTH * 0.8 : (Mixins.MAX_WIDTH * 0.8) / 2
          }
          label={nextLabel}
          onPress={() => {
            if (onPressNext) {
              onPressNext();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
        />
      </CustomView>
    );
  };

  const CartItemsStep = ({visible, cartItems}) => {
    return (
      <CustomView
        horizontalCenter
        flex={visible}
        width={Mixins.MAX_WIDTH}
        border={1}
        borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
        marginVertical={1}>
        <CustomView
          horizontalCenter
          verticalCenter
          width={Mixins.MAX_WIDTH}
          style={{backgroundColor: visible ? Colors.PRIMARY : Colors.WHITE}}>
          <Text
            center
            style={[
              visible
                ? {
                    borderBottomWidth: 1,
                    borderColor: Mixins.BLACK,
                    width: Mixins.MAX_WIDTH,
                    color: Colors.WHITE,
                    fontWeight: 'bold',
                  }
                : {},
              {paddingVertical: normalize(10)},
            ]}>
            {t('cart_checkout_onestep.veiw.stepCartItems')}
          </Text>
        </CustomView>
        <RenderIf condition={visible}>
          <CustomView horizontalCenter verticalCenter spaceBetween flex>
            <FlatList
              style={{width: Mixins.MAX_WIDTH - 10}}
              data={cartItems}
              renderItem={({item}) => (
                <CustomView
                  flex
                  row
                  horizontalCenter
                  verticalCenter
                  style={{
                    borderBottomWidth: 1,
                    borderColor: Colors.GRAY_MEDIUM,
                  }}>
                  <CustomView
                    horizontalStart
                    flexNumber={1.5}
                    paddingVertical={10}>
                    {item.image ? (
                      <FastImage
                        key={item.url_key}
                        style={{
                          height: normalize(110),
                          width: Mixins.MAX_WIDTH * 0.25,
                          borderColor: Colors.GRAY_MEDIUM,
                          borderWidth: 1,
                          borderRadius: normalize(10),
                          resizeMode: 'contain',
                          alignSelf: 'center',
                        }}
                        source={{
                          uri: item.image,
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
                    <Text style={styles.cartItemDetailText}>{item.name}</Text>
                    <Text style={styles.cartItemDetailText}>
                      {t('cart_checkout_onestep.view.qty')} {item.quantity}
                    </Text>
                    <Text bold style={[styles.cartItemDetailText]}>
                      {t('cart_checkout_onestep.view.idr')} {item.price}
                    </Text>

                    <CustomView
                      row
                      spaceBetween
                      width={100}
                      marginVertical={15}>
                      <ModalUpdateCartItem
                        name={item.name}
                        cartItemId={item.cartItemId}
                        initialQuantity={item.quantity}
                        propStyle={styles.cartItemActionIcon}>
                        <SimpleLineIcons name="pencil" size={normalize(15)} />
                      </ModalUpdateCartItem>
                      <ButtonRemoveItemFromCart
                        cartItemId={item.cartItemId}
                        propStyle={styles.cartItemActionIcon}>
                        <SimpleLineIcons name="trash" size={normalize(15)} />
                      </ButtonRemoveItemFromCart>
                    </CustomView>
                  </CustomView>
                </CustomView>
              )}
              keyExtractor={item => item.cartItemId.toString()}
              ListEmptyComponent={
                cartItems === undefined || cartItems === null ? (
                  <ActivityIndicator />
                ) : (
                  <Text center>{t('cart_checkout_onestep.view.noData')}</Text>
                )
              }
            />
            <StepNavigationBtnBlock noBackButton />
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  };

  const AddressStep = ({visible}) => {
    const userAddresses = useReactiveVar(rxUserAddresses);
    const selectedShippingAddress = useReactiveVar(rxCartShippingAddress);
    const selectedBillingAddress = useReactiveVar(rxCartBillingAddress);

    return (
      <CustomView
        horizontalCenter
        flex={visible}
        width={Mixins.MAX_WIDTH}
        border={1}
        borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
        marginVertical={1}>
        <CustomView
          horizontalCenter
          verticalCenter
          width={Mixins.MAX_WIDTH}
          style={{backgroundColor: visible ? Colors.PRIMARY : Colors.WHITE}}>
          <Text
            center
            style={[
              visible
                ? {
                    borderBottomWidth: 1,
                    borderColor: Mixins.BLACK,
                    width: Mixins.MAX_WIDTH,
                    color: Colors.WHITE,
                    fontWeight: 'bold',
                  }
                : {},
              {paddingVertical: normalize(10)},
            ]}>
            {t('cart_checkout_onestep.view.stepShipping')}
          </Text>
        </CustomView>
        <RenderIf condition={visible}>
          <CustomView horizontalCenter verticalCenter spaceBetween flex>
            <ShippingAddressBlock
              selectedShippingAddress={selectedShippingAddress}
              selectedBillingAddress={selectedBillingAddress}
              userAddresses={userAddresses}
              onSelectShippingAddress={onSelectShippingAddress}
              shippingAddressLoading={shippingAddressLoading}
            />
            <StepNavigationBtnBlock />
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  };

  const ShippingMethodStep = ({visible, selectedShippingMethod}) => {
    const cartIsVirtual = useReactiveVar(rxCartIsVirtual);
    const selectedShippingAddress = useReactiveVar(rxCartShippingAddress);
    const activeSections = useReactiveVar(rxCartShipping);

    const updateSections = activeSection => {
      rxCartShipping(activeSection);
    };

    return (
      <CustomView
        horizontalCenter
        flex={visible}
        width={Mixins.MAX_WIDTH}
        border={1}
        borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
        marginVertical={1}>
        <CustomView
          horizontalCenter
          verticalCenter
          width={Mixins.MAX_WIDTH}
          style={{backgroundColor: visible ? Colors.PRIMARY : Colors.WHITE}}>
          <Text
            center
            style={[
              visible
                ? {
                    borderBottomWidth: 1,
                    borderColor: Mixins.BLACK,
                    width: Mixins.MAX_WIDTH,
                    color: Colors.WHITE,
                    fontWeight: 'bold',
                  }
                : {},
              {paddingVertical: normalize(10)},
            ]}>
            {t('cart_checkout_onestep.view.stepShippingMethod')}
          </Text>
        </CustomView>
        <RenderIf condition={visible}>
          <CustomView horizontalCenter verticalCenter spaceBetween flex>
            <RenderIf condition={!cartIsVirtual}>
              <ShippingMethodBlock
                selectedShippingAddress={selectedShippingAddress}
                availableShippingMethods={availableShippingMethods}
                selectedShippingMethod={selectedShippingMethod}
                onSelectShippingMethod={onSelectShippingMethod}
                activeSections={activeSections}
                updateSections={updateSections}
              />
            </RenderIf>
            <StepNavigationBtnBlock />
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  };

  const PaymentStep = ({visible, selectedPaymentMethod}) => {
    const activeSections = useReactiveVar(rxCartPayment);

    const updateSections = activeSection => {
      rxCartPayment(activeSection);
    };

    return (
      <CustomView
        horizontalCenter
        width={Mixins.MAX_WIDTH}
        flex={visible}
        border={1}
        borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
        marginVertical={1}>
        <CustomView
          horizontalCenter
          verticalCenter
          width={Mixins.MAX_WIDTH}
          style={{backgroundColor: visible ? Colors.PRIMARY : Colors.WHITE}}>
          <Text
            center
            style={[
              visible
                ? {
                    borderBottomWidth: 1,
                    borderColor: Mixins.BLACK,
                    width: Mixins.MAX_WIDTH,
                    color: Colors.WHITE,
                    fontWeight: 'bold',
                  }
                : {},
              {paddingVertical: normalize(10)},
            ]}>
            {t('cart_checkout_onestep.view.stepPaymentMethod')}
          </Text>
        </CustomView>
        <RenderIf condition={visible}>
          <CustomView horizontalCenter verticalCenter spaceBetween flex>
            <PaymentMethodBlock
              availablePaymentMethods={availablePaymentMethods}
              selectedPaymentMethod={selectedPaymentMethod}
              onSelectPaymentMethod={onSelectPaymentMethod}
              activeSections={activeSections}
              updateSections={updateSections}
            />
            <StepNavigationBtnBlock
              onPressNext={() => {
                onSummaryStep();
              }}
            />
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  };

  const SummaryStep = ({visible, cartPrices}) => {
    if (cartPrices) {
      const {
        prices,
        applied_store_credit,
        shipping_addresses,
        applied_extra_fee,
      } = cartPrices;

      const {grand_total, subtotal_including_tax} = prices;
      const {extrafee_value} = applied_extra_fee;
      const {is_use_store_credit, store_credit_amount} = applied_store_credit;
      const {selected_shipping_method} = shipping_addresses[0];
      const shippingFee = selected_shipping_method.amount;

      return (
        <CustomView
          horizontalCenter
          width={Mixins.MAX_WIDTH}
          flex={visible}
          border={1}
          borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
          marginVertical={1}>
          <CustomView
            horizontalCenter
            verticalCenter
            width={Mixins.MAX_WIDTH}
            style={{
              backgroundColor: visible ? Colors.PRIMARY : Colors.WHITE,
            }}>
            <Text
              center
              style={[
                visible
                  ? {
                      borderBottomWidth: 1,
                      borderColor: Mixins.BLACK,
                      width: Mixins.MAX_WIDTH,
                      color: Colors.WHITE,
                      fontWeight: 'bold',
                    }
                  : {},
                {paddingVertical: normalize(10)},
              ]}>
              {t('cart_checkout_onestep.view.stepSummary')}
            </Text>
          </CustomView>
          <RenderIf condition={visible}>
            <CustomView
              horizontalCenter
              verticalCenter
              horizontalStart
              spaceBetween
              flex
              marginVertical={10}>
              <CustomView horizontalStart>
                <Text>
                  {t('cart_checkout_onestep.view.subtotal')}{' '}
                  {subtotal_including_tax.value}
                </Text>
                <RenderIf condition={applied_extra_fee.show_on_cart}>
                  <Text>{t('cart_checkout_onestep.view.extraFee')}</Text>
                  <Text style={{marginLeft: normalize(20)}}>
                    {applied_extra_fee.title}: {extrafee_value.value}
                  </Text>
                </RenderIf>
                <RenderIf condition={is_use_store_credit}>
                  <Text>
                    {t('cart_checkout_onestep.view.storeCredit')}{' '}
                    {store_credit_amount}
                  </Text>
                </RenderIf>
                <Text>
                  {t('cart_checkout_onestep.view.shippingFee')}{' '}
                  {shippingFee.value}
                </Text>
                <Text>
                  {t('cart_checkout_onestep.view.grandTotal')}{' '}
                  {grand_total.value}
                </Text>
              </CustomView>
              <StepNavigationBtnBlock
                nextLabel="Order"
                onPressNext={onPlaceOrder}
              />
            </CustomView>
          </RenderIf>
        </CustomView>
      );
    } else {
      return (
        <CustomView
          horizontalStart
          flex={visible}
          width={Mixins.MAX_WIDTH}
          border={1}
          borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
          marginVertical={1}>
          <CustomView
            horizontalCenter
            verticalCenter
            width={Mixins.MAX_WIDTH}
            style={{
              backgroundColor: visible ? Colors.PRIMARY : Colors.WHITE,
            }}>
            <Text
              center
              style={[
                visible
                  ? {
                      borderBottomWidth: 1,
                      borderColor: Mixins.BLACK,
                      width: Mixins.MAX_WIDTH,
                      color: Colors.WHITE,
                      fontWeight: 'bold',
                    }
                  : {},
                {paddingVertical: normalize(10)},
              ]}>
              {t('cart_checkout_onestep.view.stepSummary')}
            </Text>
          </CustomView>
          <RenderIf condition={visible}>
            <ActivityIndicator />
          </RenderIf>
        </CustomView>
      );
    }
  };

  return (
    <CustomView flex safe>
      <NavBar
        title={t('cart_checkout_onestep.title.oneStepCheckout')}
        onBack={() => {
          if (currentStep !== 1) {
            setCurrentStep(currentStep - 1);
          } else {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }
        }}
      />
      <CustomView flex horizontalCenter verticalCenter width={Mixins.MAX_WIDTH}>
        <CartItemsStep
          visible={STEP[currentStep] === STEP[1]}
          cartItems={cartItems}
        />

        <AddressStep visible={STEP[currentStep] === STEP[2]} />

        <ShippingMethodStep
          visible={STEP[currentStep] === STEP[3]}
          selectedShippingMethod={selectedShippingMethod}
        />

        <PaymentStep
          visible={STEP[currentStep] === STEP[4]}
          selectedPaymentMethod={selectedPaymentMethod}
        />

        <SummaryStep
          visible={STEP[currentStep] === STEP[5]}
          cartPrices={cartPrices}
        />
      </CustomView>
      <SnapWebView
        snapUrl={snapUrl}
        showSnapModal={showSnapModal}
        setShowSnapModal={setShowSnapModal}
      />
    </CustomView>
  );
}

export default OneStepCheckoutScreen;
