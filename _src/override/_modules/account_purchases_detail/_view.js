import React, {memo} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import {
  Divider as PaperDivider,
  MD2Colors as ColorsPaper,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';
import FeatherIcon from 'react-native-vector-icons/Feather';

import lStartCase from 'lodash/startCase';

import styles from '@app/_modules/account_purchases_detail/styles';
import ListCart from '@app/_modules/cart_edit/atoms/ListCart/index';
import I from '@app/assets/svgs/I';
import Alert from '@app/components/Alert';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import GwpOffer from '@app/components/GwpOffer';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {ORDER_STATUS, RETURN_DISPLAY_STATUS} from '@app/helpers/Constants';
import {numberFormat, numberFormatBy} from '@app/helpers/General';
import useCountdown from '@app/hooks/useCountdown';
import {Colors, Mixins} from '@app/styles';

import ReturnReasonModal from './atoms/ReturnReasonModal';

/**
 * Pending-payment countdown (non-BCA VA):
 *  - Accepts either input (expireTimestamp takes precedence when both given):
 *      • expireTimestamp — absolute expiration timestamp (ms)
 *      • countDown       — remaining seconds, e.g. the backend
 *        payment_countdown field; forwarded to the hook's durationSeconds mode
 *  - NO hardcoded fallback: when neither input is valid the timer stays at
 *    00:00:00 and NEVER fires onExpire (a stale default would instantly
 *    expire → refetch → remount → expire again = infinite loading loop)
 */
const CountdownTimer = memo(
  ({t, expireTimestamp = null, countDown = null, onExpire}) => {
    const {formatted} = useCountdown({
      expireTimestamp,
      durationSeconds: countDown,
      onExpire,
    });

    return (
      <CustomView style={styles.countdownContainer}>
        <Text style={styles.countdownLabel}>
          {t('account_purchases_detail.view.pendingPaymentCountDown')}
        </Text>
        <Text style={styles.countdownValue}>{formatted}</Text>
      </CustomView>
    );
  },
);

const BcaVaCard = memo(
  ({
    t,
    expireTimestamp = null,
    countDown = null,
    virtualAccount,
    onExpire,
    onCopy,
  }) => {
    const {hours, minutes, seconds} = useCountdown({
      expireTimestamp,
      durationSeconds: countDown,
      onExpire,
    });

    return (
      <CustomView marginBottom={16} style={styles.bcaVaCard}>
        <CustomView row horizontalCenter spaceBetween width="100%">
          <Text style={styles.bcaVaNumber}>{virtualAccount}</Text>
          <TouchableOpacity onPress={() => onCopy(virtualAccount)}>
            <Text style={styles.bcaCopyText}>Copy</Text>
          </TouchableOpacity>
        </CustomView>
        <Text style={styles.bcaExpiresText}>
          {t('account_purchases_detail.view.expiresIn', {
            hours,
            minutes,
            seconds,
          })}
        </Text>
      </CustomView>
    );
  },
);

const Divider = ({height = 1, backgroundColor}) => (
  <PaperDivider
    style={{
      height,
      backgroundColor: backgroundColor ?? ColorsPaper.grey200,
    }}
  />
);

const onRenderComment = ({item}) => {
  return (
    <CustomView paddingBottom={20} paddingTop={10} style={styles.bmLine}>
      <Text>{item.timestamp}</Text>
      <Text>{item.message}</Text>
    </CustomView>
  );
};

const DeliveryDetailsCard = ({onNavigateToDeliveryDetails, detailOrder}) => {
  const formatAddress = addr => {
    if (!addr) {
      return '';
    }
    const street = addr.street?.join(', ') || '';
    return `${street}, ${addr.city || ''}, ${addr.region || ''} ${
      addr.postcode || ''
    }`
      .replace(/,\s*,/g, ',')
      .replace(/,\s*$/, '')
      .trim();
  };

  const deliveryData = {
    shippingAddress: formatAddress(detailOrder?.shipping_address),
  };

  const handlePress = () => {
    if (onNavigateToDeliveryDetails) {
      onNavigateToDeliveryDetails(deliveryData);
    }
  };

  return (
    <View style={styles.deliveryCard}>
      <TouchableOpacity
        style={styles.deliveryHeader}
        onPress={handlePress}
        activeOpacity={0.7}>
        <Text style={styles.deliveryTitle}>Delivery details</Text>
        <Text style={styles.arrowIcon}>
          <Image
            source={require('@app/assets/images/rightArrows.png')}
            style={styles.arrowImage}
          />
        </Text>
      </TouchableOpacity>
      <View style={styles.shippingAddressSection}>
        <View style={styles.shippingAddressHeader}>
          <Image
            source={require('@app/assets/images/locationIcon.png')}
            style={styles.locationImage}
          />
          <Text style={styles.shippingAddressTitle}>Shipping address</Text>
        </View>
        <Text style={styles.shippingAddressText}>
          {deliveryData.shippingAddress}
        </Text>
      </View>
    </View>
  );
};

const EarnPoints = ({t}) => {
  return (
    <CustomView
      paddingTop={24}
      paddingBottom={12}
      paddingHorizontal={12}
      style={styles.bmLine}>
      <Text style={styles.earnPointsTitle}>
        {t('account_purchases_detail.title.earnPoints')}
      </Text>
      <View style={styles.earnPointsRow}>
        <I
          width={Mixins.normalize(12)}
          height={Mixins.normalize(12)}
          marginTop={Mixins.normalize(2)}
          color={'#FF8200'}
        />
        <Text style={styles.earnPointsDesc}>
          {t('account_purchases_detail.view.earnPointsDesc')}
        </Text>
      </View>
    </CustomView>
  );
};

/**
 * ---------------------------------------------------- *
 * @components PurchaseDetailScreen
 * @summary view component for refund order screen
 * ---------------------------------------------------- *
 */
const PurchaseDetailScreen = ({
  t,
  loading,
  error,
  itemQty,
  products,
  copyAlert,
  onCopy,
  modalVisible,
  setModalVisible,
  detailOrder,
  reasonList,
  isVaOrPendingPayment,
  onNavigateToProductDetail,
  onCancelOrder,
  onReturnedProduct,
  onRefundDetail,
  onPayNow,
  onPressReorder,
  getShipments,
  onNavigateToDeliveryDetails,
  onDownloadInvoice,
  downloadingInvoice,
  onConfirmReason,
  onExpire,
  onContinuePayment,
  cancelling,
}) => {
  const orderStatusStyle = detailOrder?.dfi_display_status ?? {};

  const orderStatusProps =
    detailOrder?.dfi_display_status?.code !== ORDER_STATUS.RETURN_REFUND
      ? detailOrder?.dfi_display_status?.return_status !== 'REFUNDED'
        ? detailOrder?.dfi_display_status
        : {
            label: 'Return/Refund',
            color: '#9E9E9E',
          }
      : {
          label: 'Completed',
          color: '#46A147',
        };

  const isBCA =
    detailOrder?.payment_methods?.[0]?.type === 'snap_banktransfer_bca';

  const isPendingPayment =
    orderStatusStyle.code === ORDER_STATUS.PENDING_PAYMENT;

  // §7: 由后端 available_actions 决定 Cancel 按钮是否展示
  const availableActions = detailOrder?.available_actions || [];
  const cancelOrderBtnDisabled =
    orderStatusStyle.code === ORDER_STATUS.CANCELED;
  const cancelOrderBtnVisible =
    availableActions.includes('CANCEL') ||
    (availableActions.length === 0 && isPendingPayment);

  // §10: 已取消订单展示取消原因（Others 时含备注）
  const cancellation = detailOrder?.dfi_cancellation;
  const cancelReasonText = cancellation
    ? [cancellation.reason, cancellation.reason_note]
        .filter(Boolean)
        .join(' - ')
    : '';

  // §5: 退款/退货卡片展示最新一条退货单
  const firstReturn = detailOrder?.returns?.items?.[0];
  const refundVisible = Boolean(firstReturn);
  const returnStatusStyle =
    RETURN_DISPLAY_STATUS[firstReturn?.display_status] ??
    RETURN_DISPLAY_STATUS.unknown;

  const isRefundOnly = firstReturn?.solution?.code === 'REFUND_ONLY';

  const returnLabel = isRefundOnly ? 'Refund Request' : 'Return & Refund';
  const returnReasonText = isRefundOnly
    ? 'Refund Reason'
    : 'Return & Refund Reason';
  const refundReasonText = firstReturn?.reason_other_text
    ? firstReturn?.reason?.label + ' - ' + firstReturn?.reason_other_text
    : firstReturn?.reason?.label;

  const returnRefundBtnText = isRefundOnly
    ? t('account_purchases_detail.btn.refundDetail')
    : t('account_purchases_detail.btn.returnRefundDetail');

  // §2: Request return 仅在 return_eligibility.can_return 时可点
  const returnEligibility = detailOrder?.return_eligibility;
  const returnOrRefundBtnVisible =
    orderStatusStyle.code === ORDER_STATUS.COMPLETED &&
    availableActions.includes('RETURN') &&
    !refundVisible;
  const returnOrRefundBtnDisabled = !returnEligibility?.can_return;

  const refundDetailBtnVisible = refundVisible;

  const reorderBtnVisible = availableActions.includes('REORDER');

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <NavBar
          useWhite
          useClose
          center
          titleBold
          childrenRight={<CustomView width={'12%'} />}
        />
        <CustomView marginTop={30}>
          <ActivityIndicator />
        </CustomView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <NavBar
          useWhite
          useClose
          center
          titleBold
          title={`#${detailOrder?.order_number}`}
          childrenRight={<CustomView width={'12%'} />}
        />
        <CustomView marginTop={30}>
          <Text>{JSON.stringify(error)}</Text>
        </CustomView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <NavBar
        useWhite
        useClose
        center
        titleBold
        title={`#${detailOrder?.order_number}`}
        childrenRight={<CustomView width={'12%'} />}
      />
      <CustomView flex>
        <ScrollView>
          <RenderIf condition={!isBCA && isPendingPayment}>
            <CountdownTimer
              t={t}
              countDown={detailOrder?.payment_countdown}
              onExpire={onExpire}
            />
          </RenderIf>
          {/* Basic Info */}
          <CustomView paddingHorizontal={14} marginTop={16}>
            <CustomView row horizontalCenter spaceBetween>
              <Text
                style={[
                  styles.orderStatusLabel,
                  {color: orderStatusProps.color},
                ]}>
                {orderStatusProps.label}
              </Text>
              <Text style={styles.createdAtText}>
                {detailOrder?.created_at}
              </Text>
            </CustomView>
            <RenderIf condition={cancelOrderBtnDisabled && cancelReasonText}>
              <CustomView marginTop={16}>
                <Text style={styles.fieldLabel}>Cancel Reason</Text>
                <Text style={styles.fieldValue}>{cancelReasonText}</Text>
              </CustomView>
            </RenderIf>
            <RenderIf condition={refundVisible}>
              <CustomView marginTop={16} style={styles.refundCard}>
                <CustomView row spaceBetween style={styles.refundCardHeader}>
                  <CustomView row horizontalCenter>
                    <LocalSvg
                      asset={require('@app/assets/svg/refund.svg')}
                      style={styles.refundIcon}
                    />
                    <Text style={styles.refundCardTitle}>{returnLabel}</Text>
                  </CustomView>
                  <CustomView row horizontalCenter>
                    <View
                      style={[
                        styles.refundStatusDot,
                        {backgroundColor: returnStatusStyle.color},
                      ]}
                    />
                    <Text
                      style={[
                        styles.refundStatusText,
                        {color: returnStatusStyle.color},
                      ]}>
                      {returnStatusStyle.label}
                    </Text>
                  </CustomView>
                </CustomView>
                <CustomView style={styles.refundCardBody}>
                  <Text style={styles.fieldLabel}>{returnReasonText}:</Text>
                  <Text style={styles.refundReasonText}>
                    {refundReasonText}
                  </Text>
                </CustomView>
              </CustomView>
            </RenderIf>
            <CustomView marginVertical={16}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <CustomView row spaceBetween horizontalCenter>
                <Text style={styles.fieldValue}>
                  {detailOrder?.payment_methods[0].name}
                </Text>
                <RenderIf condition={isPendingPayment}>
                  <CustomView row horizontalCenter onPress={onContinuePayment}>
                    <Text
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: '500',
                        fontSize: 14,
                        color: '#ff8200',
                        textDecorationLine: 'underline',
                        lineHeight: 20,
                      }}>
                      continue payment{' '}
                      <FeatherIcon
                        name="arrow-right"
                        size={10}
                        color="#ff8200"
                      />
                    </Text>
                  </CustomView>
                </RenderIf>
              </CustomView>
            </CustomView>
            <RenderIf condition={isBCA && isPendingPayment}>
              <BcaVaCard
                t={t}
                countDown={detailOrder?.payment_countdown}
                virtualAccount={
                  detailOrder?.detail?.[0]?.payment.payment_additional_info
                    .virtual_account
                }
                onExpire={onExpire}
                onCopy={onCopy}
              />
            </RenderIf>
            <Divider />
            <RenderIf condition={getShipments?.length > 0}>
              <CustomView marginTop={16}>
                <Text style={styles.fieldLabel}>Shipped To</Text>
                <Text style={styles.fieldValue}>
                  {getShipments.map((item, index) => {
                    if (item?.tracking) {
                      return item?.tracking?.map(
                        (itemTracking, indexTracking) => {
                          return (
                            <Text
                              key={'tracking-item-' + indexTracking}
                              style={styles.textLeft}>
                              <Text bold>
                                {lStartCase(
                                  t(
                                    'account_purchases_detail.label.trackingNumber',
                                  ),
                                ) + ':'}
                              </Text>{' '}
                              {itemTracking?.number}
                            </Text>
                          );
                        },
                      );
                    }
                    return null;
                  })}
                </Text>
              </CustomView>
            </RenderIf>
            <CustomView marginVertical={16}>
              <Text style={styles.fieldLabel}>Shipping Method</Text>
              <Text style={styles.fieldValue}>
                {detailOrder?.shipping_method}
              </Text>
            </CustomView>
            <Divider />
            {/* Download Invoice */}
            <CustomView marginTop={16} style={styles.downloadInvoiceButton}>
              <Text style={styles.downloadInvoiceButtonText}>
                Download Invoice
              </Text>
            </CustomView>
          </CustomView>
          <DeliveryDetailsCard
            onNavigateToDeliveryDetails={onNavigateToDeliveryDetails}
            detailOrder={detailOrder}
          />
          <CustomView
            row
            flex={1}
            height={2}
            backgroundColor={ColorsPaper.grey200}
          />
          <RenderIf condition={detailOrder?.comments?.length > 0}>
            <CustomView padding={20}>
              <CustomView paddingBottom={10}>
                <Text xlarge bold color={Colors.DARK}>
                  {t('account_purchases_detail.view.aboutOrder')}
                </Text>
              </CustomView>
              <FlatList
                style={styles.listContainer}
                data={detailOrder?.comments}
                renderItem={onRenderComment}
                keyExtractor={item => item.timestamp.toString()}
              />
            </CustomView>
          </RenderIf>
          <CustomView
            marginTop={24}
            paddingHorizontal={12}
            style={styles.bmLine}>
            <Text color={Colors.GRAY_DARK2} style={styles.itemOrderedText}>
              {itemQty} {t('account_purchases_detail.view.itemOrdered')}
            </Text>
            {products &&
              products.map((item, index) => {
                if (item?.is_gwp) {
                  return null;
                }

                return (
                  <CustomView key={'list-product-detail-item-' + index}>
                    <ListCart
                      item={item}
                      onNavigateToProductDetail={onNavigateToProductDetail}
                      isViewOnly
                    />
                    <RenderIf condition={index < products.length - 1}>
                      <Divider />
                    </RenderIf>
                  </CustomView>
                );
              })}
          </CustomView>
          {true && <EarnPoints t={t} />}
          <GwpOffer
            orderId={detailOrder?.order_number}
            initialVisible={2}
            showStatus={false}
            showEligibleBadge={false}
            showLimitedStockText={false}
          />
          {/* Total amount */}
          <CustomView marginTop={8} marginBottom={24} paddingHorizontal={12}>
            <CustomView row spaceBetween>
              <Text>{t('account_purchases_detail.view.subtotal')}</Text>
              <Text>
                {numberFormat(
                  detailOrder?.total.subtotal?.currency,
                  detailOrder?.total.subtotal?.value,
                  ',',
                  2,
                )}
              </Text>
            </CustomView>
            <CustomView row spaceBetween>
              <Text>{t('account_purchases_detail.view.shipping')}</Text>
              <Text>
                {numberFormat(
                  detailOrder?.total.total_shipping?.currency,
                  detailOrder?.total.total_shipping?.value,
                  ',',
                  2,
                )}
              </Text>
            </CustomView>
            {/* Cart Discount 在详情页不单独展示（金额已包含在总折扣中） */}

            {/* Product Discount（红色行，保持不变） */}
            <RenderIf condition={detailOrder?.total?.total_tp_discount?.value}>
              <CustomView row spaceBetween>
                <Text>
                  {t('account_purchases_detail.view.productDiscount')}
                </Text>
                <Text>
                  {numberFormat(
                    detailOrder?.total?.total_tp_discount?.currency,
                    detailOrder?.total?.total_tp_discount?.value * -1,
                    ',',
                    2,
                  )}
                </Text>
              </CustomView>
            </RenderIf>
            {/* 优惠券说明：和 Checkout 一样的黄色胶囊（使用 total.promotions），放在 Student Discount 上方 */}
            {detailOrder?.promotions &&
              detailOrder.promotions.map((promo, index) => (
                <CustomView
                  key={`order-promo-${index}`}
                  row
                  spaceBetween
                  style={styles.discountRow}>
                  <CustomView style={styles.promoPill}>
                    <Text
                      style={styles.promoPillText}
                      numberOfLines={2}
                      ellipsizeMode="tail">
                      {promo.label}
                    </Text>
                  </CustomView>
                  <Text style={styles.promoAmountText}>
                    {'-'}
                    {numberFormat(
                      promo?.amount?.currency,
                      promo?.amount?.value,
                      ',',
                      2,
                    )}
                  </Text>
                </CustomView>
              ))}

            <RenderIf condition={detailOrder?.total?.student_discount?.value}>
              <CustomView row spaceBetween style={styles.discountRow}>
                <CustomView style={styles.studentDiscountPill}>
                  <Text style={styles.promoPillText}>
                    {t('account_purchases_detail.view.studentDiscount')}
                  </Text>
                </CustomView>
                <Text style={styles.studentDiscountAmountText}>
                  {numberFormat(
                    detailOrder?.total?.student_discount?.currency,
                    detailOrder?.total?.student_discount?.value * -1,
                    ',',
                    2,
                  )}
                </Text>
              </CustomView>
            </RenderIf>
            <RenderIf
              condition={
                detailOrder?.total?.loyalty_points?.loyalty_points_total?.value
              }>
              <CustomView row spaceBetween>
                <Text>
                  {t('account_purchases_detail.view.burnPoint', {
                    point: numberFormatBy(
                      '',
                      detailOrder?.total?.loyalty_points?.point,
                    ),
                  })}
                </Text>
                <Text>
                  {'-'}
                  {numberFormat(
                    detailOrder?.total?.loyalty_points?.loyalty_points_total
                      ?.currency,
                    detailOrder?.total?.loyalty_points?.loyalty_points_total
                      ?.value,
                    ',',
                    2,
                  )}
                </Text>
              </CustomView>
            </RenderIf>

            <RenderIf
              condition={
                detailOrder?.detail[0]?.aw_giftcard &&
                detailOrder?.detail[0]?.aw_giftcard?.giftcard_amount > 0
              }>
              <CustomView row spaceBetween>
                <Text>{t('cart_checkout.giftCardApplied')}</Text>
                <Text style={styles.negativeAmountText}>
                  {numberFormat(
                    null,
                    detailOrder?.detail[0]?.aw_giftcard?.giftcard_amount,
                    ',',
                    2,
                  )}
                </Text>
              </CustomView>
            </RenderIf>
            <RenderIf
              condition={
                detailOrder?.detail[0]?.aw_store_credit?.store_credit_amount
              }>
              <CustomView row spaceBetween>
                <Text>{t('cart_checkout.storeCredit')}</Text>
                <Text style={styles.negativeAmountText}>
                  {numberFormat(
                    null,
                    detailOrder?.detail[0]?.aw_store_credit
                      ?.store_credit_amount,
                    ',',
                    2,
                  )}
                </Text>
              </CustomView>
            </RenderIf>

            <CustomView row spaceBetween>
              <Text bold xlarge>
                {t('account_purchases_detail.view.total')}
              </Text>
              <Text bold xlarge>
                {numberFormat(
                  detailOrder?.total.grand_total.currency,
                  detailOrder?.total.grand_total.value,
                  ',',
                  2,
                )}
              </Text>
            </CustomView>

            {/* Cancel order */}
            <RenderIf condition={cancelOrderBtnVisible}>
              <Button
                onPress={onCancelOrder}
                label={t('account_purchases_detail.btn.cancelOrder')}
                width={Mixins.MAX_WIDTH * 0.9}
                borderRadius={4}
                loadingColor={Colors.PRIMARY}
                textStyleProp={[
                  styles.secondaryButtonText,
                  cancelOrderBtnDisabled && styles.secondaryButtonTextDisabled,
                ]}
                styleProp={[
                  styles.secondaryButtonContainer,
                  cancelOrderBtnDisabled &&
                    styles.secondaryButtonContainerDisabled,
                ]}
              />
            </RenderIf>

            {/* Return / Refund */}
            <RenderIf condition={returnOrRefundBtnVisible}>
              <Button
                disabled={returnOrRefundBtnDisabled}
                onPress={onReturnedProduct}
                label={t('account_purchases_detail.btn.returnOrRefund')}
                width={Mixins.MAX_WIDTH * 0.9}
                borderRadius={4}
                loadingColor={Colors.PRIMARY}
                textStyleProp={[
                  styles.secondaryButtonText,
                  returnOrRefundBtnDisabled &&
                    styles.secondaryButtonTextDisabled,
                ]}
                styleProp={[
                  styles.secondaryButtonContainer,
                  returnOrRefundBtnDisabled &&
                    styles.secondaryButtonContainerDisabled,
                ]}
              />
            </RenderIf>

            {/* Refund detail */}
            <RenderIf condition={refundDetailBtnVisible}>
              <Button
                onPress={onRefundDetail}
                label={returnRefundBtnText}
                width={Mixins.MAX_WIDTH * 0.9}
                borderRadius={4}
                loadingColor={Colors.PRIMARY}
                textStyleProp={[styles.secondaryButtonText]}
                styleProp={[styles.secondaryButtonContainer]}
              />
            </RenderIf>
          </CustomView>
          <RenderIf condition={reorderBtnVisible}>
            <Divider height={2} />
            <Button
              onPress={onPressReorder}
              label={
                isPendingPayment
                  ? t('account_purchases_detail.btn.payNow')
                  : t('account_purchases_detail.btn.reorder')
              }
              width={Mixins.MAX_WIDTH * 0.9}
              borderRadius={8}
              loadingColor={Colors.WHITE}
              textStyleProp={styles.reorderButtonText}
              styleProp={styles.mainButtonContainer}
            />
          </RenderIf>
        </ScrollView>
      </CustomView>

      <RenderIf condition={copyAlert}>
        <View style={styles.alertOverlay} pointerEvents="box-none">
          <Alert
            message={t('account_purchases_detail.view.copySuccess')}
            style={styles.copyAlertBox}
            labelStyle={styles.copyAlertLabel}
          />
        </View>
      </RenderIf>

      <ReturnReasonModal
        t={t}
        visible={modalVisible}
        title={t('account_purchases_detail.title.reason')}
        loading={!reasonList.length}
        confirmLoading={cancelling}
        reasonList={reasonList}
        setVisible={setModalVisible}
        onOk={onConfirmReason}
      />
    </SafeAreaView>
  );
};

export default PurchaseDetailScreen;
