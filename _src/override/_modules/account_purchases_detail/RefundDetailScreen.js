import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';

import {Divider} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {StackActions, useNavigation} from '@react-navigation/native';

import RenderIf from '@root/_src/core/components/RenderIf';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import {uploadReturnAttachments} from '@app/_modules/account_purchases_detail/services/attachment';
import {
  ADD_RETURN_COMMENT,
  GET_CUSTOMER_RETURN,
} from '@app/_modules/account_purchases_detail/services/schema';
import InfoIcon from '@app/assets/svg/info.svg';
import RejectedIcon from '@app/assets/svg/rejected.svg';
import SuccessIcon from '@app/assets/svg/success.svg';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import InputBox from '@app/components/InputBox';
import NavBar from '@app/components/NavBar';
import {RETURN_DISPLAY_STATUS} from '@app/helpers/Constants';
import {numberFormat} from '@app/helpers/General';
import useCustomQuery from '@app/hooks/useCustomQuery';
import client from '@app/services/api';
import {rxAppSnackbar, rxRefreshOrderDetail} from '@app/services/cache';
import {Colors, Mixins} from '@app/styles';

import Barcode from './atoms/Barcode';
import HelpModal from './atoms/HelpModal';
import MediaUploader from './atoms/MediaUploader';
import StepsIndicator from './atoms/StepsIndicator';
import commonStyles from './common.style';

/**
 * ---------------------------------------------------- *
 * @function getStatusBannerText
 * @summary 按 display_status 展示顶部提示文案（§5）
 * ---------------------------------------------------- *
 */
const getStatusBannerText = (displayStatus, isReturnRefund) => {
  if (!isReturnRefund) {
    switch (displayStatus) {
      case 'PENDING_APPROVAL':
        return {
          icon: InfoIcon,
          message:
            "We're reviewing your refund request. We'll notify you once it's approved.",
        };
      case 'APPROVED':
        return {
          icon: SuccessIcon,
          message:
            'Your refund has been approved. The amount will be returned to your original payment method within 1-3 business days.',
        };
      case 'REJECTED':
        return {
          icon: RejectedIcon,
          message:
            'Your refund request was rejected. If you think this is wrong or need help, contact our support team.',
        };
      case 'PROCESSING':
        return {
          icon: SuccessIcon,
          message:
            'Your refund is being processed. It usually takes 1–3 business days.',
        };
      case 'REFUNDED':
        return {
          icon: SuccessIcon,
          message:
            'Your refund has been completed. The amount has been credited back to your original payment method.',
        };
      default:
        return {
          icon: InfoIcon,
          message:
            "We're reviewing your refund request. We'll notify you once it's approved.",
        };
    }
  }

  switch (displayStatus) {
    case 'PENDING_APPROVAL':
      return {
        icon: InfoIcon,
        message: 'Waiting for Guardian confirmation, please be patient.',
      };
    case 'APPROVED':
      return {
        icon: SuccessIcon,
        message:
          'Your return is approved. Please prepare your parcel for pickup.',
      };
    case 'REJECTED':
      return {
        icon: RejectedIcon,
        message: 'Your return request has been rejected.',
      };
    case 'IN_RETURN_TRANSIT':
      return {
        icon: SuccessIcon,
        message: 'Your parcel is on its way back to our warehouse.',
      };
    case 'GOODS_RETURNED':
      return {
        icon: SuccessIcon,
        message: 'We have received your parcel and it is being checked.',
      };
    case 'PROCESSING':
      return {
        icon: SuccessIcon,
        message: 'Your refund is being processed.',
      };
    case 'REFUNDED':
      return {
        icon: SuccessIcon,
        message: 'Your refund has been sent. Thank you!',
      };
    default:
      return {
        icon: InfoIcon,
        message: 'Waiting for Guardian confirmation, please be patient.',
      };
  }
};

/**
 * ---------------------------------------------------- *
 * @hooks useRefundDetail
 * @summary collections state and handler for this screen
 * ---------------------------------------------------- *
 */
const useRefundDetail = ({route}) => {
  const navigation = useNavigation();
  const returnUid = route?.params?.returnUid;
  const orderNumber = route?.params?.orderNumber;

  const [modalVisible, setModalVisible] = useState(false);
  const [trackingExpanded, setTrackingExpanded] = useState(false);

  /**
   * ---------------------------------------------------- *
   * @query customer.return(uid)
   * @summary 退货详情 + 进度（§5 §9）。attachments 的签名 URL
   *          30 分钟过期，不读缓存（network-only）
   * ---------------------------------------------------- *
   */
  const {
    data: returnResult,
    loading,
    error,
    onRefetchData: refetchReturn,
  } = useCustomQuery({
    schema: GET_CUSTOMER_RETURN,
    useInitData: true,
    variables: {uid: returnUid},
    opts: {fetchPolicy: 'network-only', context: {method: 'POST'}},
  });

  const returnData = _.get(returnResult, 'data.customer.return') || null;

  const displayStatus = returnData?.display_status;
  const statusStyle =
    RETURN_DISPLAY_STATUS[displayStatus] ?? RETURN_DISPLAY_STATUS.unknown;

  const isReturnRefund =
    returnData?.solution?.code === 'RETURN_AND_REFUND' ||
    (!returnData && route?.params?.refundType === 'return_refund');

  const statusBannerText = getStatusBannerText(displayStatus, isReturnRefund);
  // 追加凭证（§6 addReturnComment）
  const [evidenceVisible, setEvidenceVisible] = useState(false);
  const [evidenceList, setEvidenceList] = useState([]);
  const [evidenceComment, setEvidenceComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const onToggleEvidence = () => {
    setEvidenceVisible(prev => !prev);
  };

  /**
   * ---------------------------------------------------- *
   * @function onSubmitEvidence
   * @summary 上传新附件拿 token 后调 addReturnComment（§6，
   *          每条评论最多 3 个附件、不强制视频）
   * ---------------------------------------------------- *
   */
  const onSubmitEvidence = async () => {
    if (submittingComment) {
      return;
    }
    const comment = evidenceComment?.trim();
    if (!comment && evidenceList.length === 0) {
      rxAppSnackbar({message: 'Please add a comment or attach a file.'});
      return;
    }
    try {
      setSubmittingComment(true);
      const tokens = evidenceList.length
        ? await uploadReturnAttachments(evidenceList)
        : [];
      await client.mutate({
        mutation: ADD_RETURN_COMMENT,
        variables: {
          input: {
            return_uid: returnUid,
            comment_text: comment || 'Additional evidence',
            ...(tokens.length ? {attachment_tokens: tokens} : {}),
          },
        },
      });
      rxAppSnackbar({message: 'Evidence added.', type: 'success'});
      setEvidenceList([]);
      setEvidenceComment('');
      setEvidenceVisible(false);
      refetchReturn();
    } catch (err) {
      const message =
        _.get(err, 'graphQLErrors[0].message') ||
        err?.message ||
        'Failed to add evidence. Please try again.';
      rxAppSnackbar({message});
    } finally {
      setSubmittingComment(false);
    }
  };

  const popToOrderDetail = () => {
    const state = navigation.getState();
    const routes = state.routes;

    let targetIndex = -1;
    for (let i = routes.length - 1; i >= 0; i--) {
      if (routes[i].name === modules.account_purchases_detail.name) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex >= 0) {
      const popCount = routes.length - 1 - targetIndex;
      if (popCount > 0) {
        rxRefreshOrderDetail(true);
        navigation.dispatch(StackActions.pop(popCount));
      }
    } else {
      navigation.goBack();
    }
  };

  const onHelpIcon = () => {
    setModalVisible(true);
  };
  const onViewMore = () => {
    setTrackingExpanded(prev => !prev);
  };

  return {
    orderNumber,
    returnData,
    loading,
    error,
    displayStatus,
    statusStyle,
    statusBannerText,
    isReturnRefund,
    trackingExpanded,
    evidenceVisible,
    evidenceList,
    evidenceComment,
    submittingComment,
    setEvidenceList,
    setEvidenceComment,
    onToggleEvidence,
    onSubmitEvidence,
    modalVisible,
    setModalVisible,
    popToOrderDetail,
    onHelpIcon,
    onViewMore,
  };
};

/**
 * ---------------------------------------------------- *
 * @components RefundDetailScreen
 * @summary view component for refund order screen
 * ---------------------------------------------------- *
 */
const RefundDetailScreen = props => {
  const {t} = useTranslation();
  const {width: windowWidth} = useWindowDimensions();
  const {
    orderNumber,
    returnData,
    loading,
    error,
    displayStatus,
    statusStyle,
    statusBannerText,
    isReturnRefund,
    trackingExpanded,
    evidenceVisible,
    evidenceComment,
    submittingComment,
    setEvidenceList,
    setEvidenceComment,
    onToggleEvidence,
    onSubmitEvidence,
    modalVisible,
    setModalVisible,
    popToOrderDetail,
    onHelpIcon,
    onViewMore,
  } = useRefundDetail(props);

  // §9: dfi_timeline 步骤条（组件内按 display_status 收敛为固定 3 步展示）
  const timeline = returnData?.dfi_timeline || [];
  const displayTimeline =
    returnData?.solution?.code !== 'REFUND_ONLY' && timeline.length > 0;
  const items = returnData?.items || [];
  const totalQty = items.reduce(
    (sum, item) => sum + (Number(item.request_quantity) || 0),
    0,
  );
  const refundAmount = returnData?.dfi_refund?.amount;
  const tracking = returnData?.dfi_tracking || null;
  const trackingEvents = tracking?.events || [];
  const comments = returnData?.comments || [];
  const lastComment = comments.length ? comments[comments.length - 1] : null;
  const attachments = returnData?.attachments || [];

  const formatPrice = (value, currency = 'IDR') => {
    const price = Number(value);
    if (!Number.isFinite(price)) {
      return '-';
    }
    const prefix = currency === 'IDR' ? 'Rp' : currency;
    return numberFormat(prefix, price, '.', 0);
  };

  /**
   * ---------------------------------------------------- *
   * @function formatItemRefund
   * @summary 单项可退金额 = refundable_unit_price.value ×
   *          request_quantity（§11）。价格数据缺失显示 '-'；
   *          数量缺失按 0 计（与 Quantity 行 x0 保持一致）
   * ---------------------------------------------------- *
   */
  const formatItemRefund = item => {
    const unitPrice = _.get(item, 'order_item.refundable_unit_price.value');
    if (unitPrice === undefined || unitPrice === null) {
      return '-';
    }
    const currency =
      _.get(item, 'order_item.refundable_unit_price.currency') || 'IDR';
    return formatPrice(
      Number(unitPrice) * (Number(item?.request_quantity) || 0),
      currency,
    );
  };

  if ((loading || error) && !returnData) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavBar
          useBack
          center
          title={
            isReturnRefund
              ? t('account_purchases_detail.title.returnRefundOrder')
              : t('account_purchases_detail.title.refundOrder')
          }
          stylesContainer={styles.navBarContainer}
          useBackPress={popToOrderDetail}
        />
        <CustomView marginTop={30}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.loadErrorText}>
              Failed to load the return detail. Please try again later.
            </Text>
          )}
        </CustomView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavBar
        useBack
        center
        title={
          isReturnRefund
            ? t('account_purchases_detail.title.returnRefundOrder')
            : t('account_purchases_detail.title.refundOrder')
        }
        stylesContainer={styles.navBarContainer}
        useBackPress={popToOrderDetail}
      />
      <ScrollView style={[styles.scrollView, styles.scrollViewNoMargin]}>
        <CustomView style={styles.warningBanner}>
          <LocalSvg asset={statusBannerText.icon} style={styles.warningIcon} />
          <Text style={styles.warningText}>{statusBannerText.message}</Text>
        </CustomView>
        <Divider style={styles.divider} />

        {/* §9: 进度步骤条（dfi_timeline + display_status 驱动，固定 3 步） */}
        <RenderIf condition={displayTimeline}>
          <StepsIndicator
            timeline={timeline}
            status={displayStatus}
            approved={displayStatus !== 'REJECTED'}
            style={styles.stepsIndicator}
          />
          <Divider style={styles.divider} />
        </RenderIf>

        <CustomView padding={14} style={styles.sectionBorder}>
          <CustomView row spaceBetween>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <Text style={[styles.orderStatusText, {color: '#757575'}]}>
              {returnData?.solution?.code === 'REFUND_ONLY'
                ? 'Refund'
                : 'Return'}
              {' - ' + statusStyle.label}
            </Text>
          </CustomView>
          <CustomView row spaceBetween marginTop={12}>
            <Text style={styles.orderInfoText}>
              {`Order Number: #${orderNumber}`}
            </Text>
            <Text style={styles.orderInfoSubText}>
              {`Total of ${totalQty} item${totalQty === 1 ? '' : 's'}`}
            </Text>
          </CustomView>
          <RenderIf condition={Boolean(refundAmount)}>
            <CustomView row spaceBetween marginTop={12}>
              <Text style={styles.orderInfoText}>Item Total</Text>
              <Text style={styles.orderInfoSubText}>
                {refundAmount &&
                  formatPrice(refundAmount.value, refundAmount.currency)}
              </Text>
            </CustomView>
          </RenderIf>
        </CustomView>

        {/* Reason */}
        <CustomView
          spaceBetween
          paddingHorizontal={14}
          paddingVertical={12}
          style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Refund Reason</Text>
          <CustomView row horizontalCenter style={styles.selectBox}>
            <Text style={styles.fieldValueText}>
              {[returnData?.reason?.label, returnData?.reason_other_text]
                .filter(Boolean)
                .join(' - ') || '-'}
            </Text>
          </CustomView>
        </CustomView>
        <CustomView
          spaceBetween
          paddingHorizontal={14}
          paddingVertical={12}
          style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Solution</Text>
          <CustomView row horizontalCenter style={styles.selectBox}>
            <Text style={styles.fieldValueText}>
              {returnData?.solution?.label || '-'}
            </Text>
          </CustomView>
        </CustomView>

        {/* §9: Tracking number（仅 awb_number 存在时展示条形码，PRD 约定不出现空标识） */}
        <RenderIf condition={isReturnRefund}>
          <CustomView paddingHorizontal={14} paddingBottom={14}>
            <CustomView row spaceBetween>
              <CustomView row horizontalCenter onPress={onHelpIcon}>
                <Text style={styles.fieldLabel}>Tracking number</Text>
                <Ionicons size={16} name="help-circle-outline" />
              </CustomView>
              <RenderIf condition={trackingEvents.length > 1}>
                <CustomView row horizontalCenter onPress={onViewMore}>
                  <Text style={styles.viewMoreText}>view more</Text>
                  <Feather
                    name={trackingExpanded ? 'chevron-up' : 'chevron-right'}
                    size={16}
                    color="#BDBDBD"
                  />
                </CustomView>
              </RenderIf>
            </CustomView>
            <RenderIf condition={Boolean(tracking?.awb_number)}>
              <CustomView style={styles.awbBox}>
                <CustomView
                  horizontalCenter
                  backgroundColor="#ffffff"
                  borderRadius={8}>
                  <Barcode
                    value={tracking?.awb_number}
                    maxWidth={windowWidth - 76}
                  />
                  <Text style={styles.awbBarcodeText}>
                    {`AWB #${tracking?.awb_number}`}
                  </Text>
                  <RenderIf condition={false && Boolean(tracking?.carrier)}>
                    <Text style={styles.awbCarrierText}>
                      {`Carrier: ${tracking?.carrier}`}
                    </Text>
                  </RenderIf>
                </CustomView>
              </CustomView>
            </RenderIf>
            <RenderIf condition={false && trackingEvents.length > 0}>
              <CustomView marginTop={12}>
                {(trackingExpanded
                  ? trackingEvents
                  : trackingEvents.slice(0, 1)
                ).map((event, index) => (
                  <CustomView key={`event-${index}`} marginBottom={10}>
                    <Text style={styles.trackingEventTitle}>
                      {event.event || event.status}
                    </Text>
                    <RenderIf condition={Boolean(event.message)}>
                      <Text style={styles.trackingEventMessage}>
                        {event.message}
                      </Text>
                    </RenderIf>
                    <RenderIf condition={Boolean(event.time)}>
                      <Text style={styles.trackingEventTime}>{event.time}</Text>
                    </RenderIf>
                  </CustomView>
                ))}
              </CustomView>
            </RenderIf>
            <RenderIf condition={!tracking}>
              <Text style={styles.trackingEventMessage}>
                Tracking information will appear once the pickup is arranged.
              </Text>
            </RenderIf>
          </CustomView>
        </RenderIf>

        <Divider style={styles.divider} />

        {/* Returned product */}
        <CustomView padding={14} style={styles.sectionBorder}>
          <Text style={styles.sectionTitle}>Returned product</Text>
          {items?.map((item, index) => (
            <CustomView
              key={item.uid ?? index}
              padding={12}
              marginTop={12}
              style={[
                styles.productItemBorder,
                index === items.length - 1 && styles.productItemNoBorder,
              ]}>
              <CustomView row style={styles.productRow}>
                <Image
                  source={{uri: item?.order_item?.product?.thumbnail?.url}}
                  style={styles.productImage}
                />
                <Text style={styles.productNameText}>
                  {item?.order_item?.product_name || '-'}
                </Text>
              </CustomView>
              <CustomView row spaceBetween horizontalCenter marginTop={12}>
                <Text style={styles.productMetaLabel}>Quantity:</Text>
                <Text style={styles.productMetaValue}>
                  {`x${item?.request_quantity ?? 0}`}
                </Text>
              </CustomView>
              <CustomView row spaceBetween horizontalCenter marginTop={6}>
                <Text style={styles.productMetaLabel}>Refund Price:</Text>
                <Text style={styles.productMetaValue}>
                  {formatItemRefund(item)}
                </Text>
              </CustomView>
            </CustomView>
          ))}
        </CustomView>

        {/* §5: Image & Video（签名 URL，30 分钟过期，展示前实时查询） */}
        <CustomView padding={14}>
          <MediaUploader
            style={styles.mediaUploader}
            readonly
            sources={attachments}
          />
          <CustomView marginTop={12} style={styles.noteBox}>
            <Text>
              {lastComment?.text ||
                returnData?.reason_other_text ||
                'No comment yet.'}
            </Text>
          </CustomView>

          {/* §6: 追加凭证（addReturnComment，最多 3 个附件、不强制视频） */}
          <RenderIf condition={false}>
            <CustomView row spaceBetween horizontalCenter marginTop={12}>
              <Text style={styles.fieldLabel}>Add more evidence</Text>
              <CustomView row horizontalCenter onPress={onToggleEvidence}>
                <Text style={styles.viewMoreText}>
                  {evidenceVisible ? 'Cancel' : 'Add'}
                </Text>
                <Feather
                  name={evidenceVisible ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#BDBDBD"
                />
              </CustomView>
            </CustomView>
            <RenderIf condition={evidenceVisible}>
              <CustomView marginTop={8}>
                <MediaUploader
                  maxFiles={3}
                  videoRequired={false}
                  onMediaChange={setEvidenceList}
                />
                <InputBox
                  multilines
                  placeholder={'Add a comment (optional)'}
                  style={styles.evidenceInput}
                  value={evidenceComment}
                  onChangeText={setEvidenceComment}
                />
                <Button
                  label={
                    submittingComment ? 'Submitting...' : 'Submit Evidence'
                  }
                  loading={submittingComment}
                  disabled={submittingComment}
                  onPress={onSubmitEvidence}
                  width={Mixins.MAX_WIDTH * 0.9}
                  borderRadius={8}
                  loadingColor={Colors.WHITE}
                  styleProp={styles.evidenceSubmitButton}
                  textStyleProp={styles.evidenceSubmitButtonText}
                />
              </CustomView>
            </RenderIf>
          </RenderIf>
        </CustomView>
      </ScrollView>

      <Divider style={styles.divider} />

      <HelpModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default RefundDetailScreen;

const styles = StyleSheet.create({
  ...commonStyles,

  /* ---------- Steps indicator ---------- */
  stepsIndicator: {
    paddingHorizontal: 36,
  },
  loadErrorText: {
    marginTop: 12,
    marginHorizontal: 14,
    fontWeight: '400',
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
  },

  /* ---------- Tracking number ---------- */
  viewMoreText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#9e9e9e',
    lineHeight: 20,
  },
  awbBox: {
    borderRadius: 8,
    paddingTop: 12,
  },
  awbBarcodeText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#212121',
    marginTop: 8,
  },
  awbCarrierText: {
    fontWeight: '400',
    fontSize: 12,
    color: '#9e9e9e',
    marginTop: 2,
  },
  trackingEventTitle: {
    fontWeight: '700',
    fontSize: 12,
    color: '#212121',
  },
  trackingEventMessage: {
    fontWeight: '400',
    fontSize: 12,
    color: '#616161',
    lineHeight: 18,
    marginTop: 2,
  },
  trackingEventTime: {
    fontWeight: '400',
    fontSize: 11,
    color: '#9e9e9e',
    marginTop: 2,
  },

  /* ---------- Evidence ---------- */
  evidenceInput: {
    height: 'auto',
    minHeight: 44,
    marginTop: 12,
    backgroundColor: '#fafafa',
    borderColor: '#f0efed',
    borderWidth: 1.3,
    borderRadius: 6,
  },
  evidenceSubmitButton: {
    height: 44,
    marginTop: 12,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#F58220',
  },
  evidenceSubmitButtonText: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    color: '#ffffff',
  },
});
