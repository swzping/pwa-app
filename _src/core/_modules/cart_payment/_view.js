import React, {useEffect, useState} from 'react';
import {Modal, SafeAreaView, ScrollView} from 'react-native';
import {WebView} from 'react-native-webview';
import Config from 'react-native-config';
import {Colors} from '@app/styles';

import Button from '@app/components/Button';
import Loader from '@app/components/Loader';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';

import ExtraFeeBlock from '@app/_modules/cart/atoms/ExtraFeeBlock';
import GiftCardBlock from '@app/_modules/cart/atoms/GiftCardBlock';
import PaymentMethodBlock from '@app/_modules/cart/atoms/PaymentMethodBlock';
import PromoCodeBlock from '@app/_modules/cart/atoms/PromoCodeBlock';
import RewardPointsBlock from '@app/_modules/cart/atoms/RewardPointsBlock';
import StoreCreditBlock from '@app/_modules/cart/atoms/StoreCreditBlock';
import TotalPriceBlock from '@app/_modules/cart/atoms/TotalPriceBlock';
import styles from '@app/_modules/cart_payment/styles';

function PaymentScreen({
  t,
  availablePaymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  paymentMethodLoading,
  onPlaceOrder,
  placeOrderLoading,
  snapUrl,
  activeSections,
  updateSections,
  refetchSnap,
  //
  selectedOptionExtraFee,
  onPressOption,
  extraFeeLoading,
  dataFee,
  dataPrices,
  dataExtraFee,
  //
  selectedShippingMethod,
  dataAppliedCoupons,
  onCouponButtonPress,
  couponsLoading,
  //
  storeCredit,
  onStoreCreditButtonPress,
  storeCreditLoading,
  dataAppliedStoreCredit,
  //
  customerRewardPoints,
  onRewardPointsButtonPress,
  rewardPointsLoading,
  aplliedRewardPoints,
  //
  onGiftCardButtonPress,
  appliedGiftCard,
}) {
  const [showSnapModal, setShowSnapModal] = useState(false);

  useEffect(() => {
    if (snapUrl) {
      setShowSnapModal(true);
    }
  }, [snapUrl]);

  const baseUrl = Config.SNAP;

  const SnapWebView = ({
    snapUrl: snapUrlParam,
    showSnapModal: showSnapModalParam,
    setShowSnapModal: setShowSnapModalParam,
  }) => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showSnapModalParam}
        onRequestClose={() => {
          setShowSnapModalParam(false);
          refetchSnap();
        }}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: Colors.WHITE,
          }}>
          <WebView
            onNavigationStateChange={webViewState => {
              if (!webViewState.url.startsWith(baseUrl)) {
                setShowSnapModalParam(false);
                refetchSnap();
              }
            }}
            source={{uri: snapUrl}}
            style={{flex: 1}}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  // MAIN
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f3f3f3'}}>
      <NavBar title={t('cart_payment.title.payment')} />
      <Loader
        loading={
          paymentMethodLoading ||
          couponsLoading ||
          extraFeeLoading ||
          rewardPointsLoading ||
          storeCreditLoading ||
          placeOrderLoading
        }
      />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{alignItems: 'center'}}>
        <CustomView paddingVertical={10} />
        <PaymentMethodBlock
          availablePaymentMethods={availablePaymentMethods}
          paymentMethodLoading={paymentMethodLoading}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={onSelectPaymentMethod}
          activeSections={activeSections}
          updateSections={updateSections}
        />

        <PromoCodeBlock
          dataAppliedCoupons={dataAppliedCoupons}
          onButtonPress={onCouponButtonPress}
        />

        <GiftCardBlock
          appliedGiftCard={appliedGiftCard}
          onButtonPress={onGiftCardButtonPress}
        />
        <RenderIf condition={!aplliedRewardPoints?.is_use_reward_points}>
          <StoreCreditBlock
            dataStoreCredit={storeCredit}
            onButtonPress={onStoreCreditButtonPress}
            dataAppliedStoreCredit={dataAppliedStoreCredit}
          />
        </RenderIf>

        {/* <RenderIf condition={!dataAppliedStoreCredit?.is_use_store_credit}> */}
        <RewardPointsBlock
          customerRewardPoints={customerRewardPoints}
          onButtonPress={onRewardPointsButtonPress}
          aplliedRewardPoints={aplliedRewardPoints}
        />
        {/* </RenderIf> */}

        <ExtraFeeBlock
          dataFee={dataFee}
          selectedOptionExtraFee={selectedOptionExtraFee}
          onPressOption={onPressOption}
        />
      </ScrollView>
      <TotalPriceBlock
        selectedShippingMethod={selectedShippingMethod}
        dataPrices={dataPrices}
        dataExtraFee={dataExtraFee}
        dataAppliedStoreCredit={dataAppliedStoreCredit}
        aplliedRewardPoints={aplliedRewardPoints}
        appliedGiftCard={appliedGiftCard}
      />

      <Button
        disabled={paymentMethodLoading || extraFeeLoading}
        onPress={onPlaceOrder}
        label={t('cart_payment.label.placeOrder')}
        styleProp={[
          styles.placeOrderButton,
          paymentMethodLoading || extraFeeLoading
            ? styles.placeOrderButtonDisabled
            : {},
        ]}
        textStyleProp={styles.placeOrderButtonText}
      />

      <SnapWebView
        snapUrl={snapUrl}
        showSnapModal={showSnapModal}
        setShowSnapModal={setShowSnapModal}
      />
    </SafeAreaView>
  );
}

export default PaymentScreen;
