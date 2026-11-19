import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Divider} from 'react-native-paper';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';

import {useNavigation} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import {uploadReturnAttachments} from '@app/_modules/account_purchases_detail/services/attachment';
import {
  GET_DFI_RETURN_OPTIONS,
  REQUEST_RETURN,
} from '@app/_modules/account_purchases_detail/services/schema';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import InputBox from '@app/components/InputBox';
import NavBar from '@app/components/NavBar';
import RadioButton from '@app/components/RadioButton';
import RenderIf from '@app/components/RenderIf';
import {numberFormat} from '@app/helpers/General';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import client from '@app/services/api';
import {rxAppSnackbar} from '@app/services/cache';
import {Colors, Mixins} from '@app/styles';

import MediaUploader, {
  validateMediaList,
} from './atoms/MediaUploader';
import styles from './ReturnOrRefundScreen.styles';

/**
 * ---------------------------------------------------- *
 * @hooks useReturnOrRefund
 * @summary 退货/退款表单逻辑（Cancel & Return §1 §3 §4 §11）
 *
 * @notes
 * - 方案/原因来自 dfiReturnOptions，进入页面查询一次（§1）
 * - 按 return_eligibility 过滤 solutions / reason_uids（§2）
 * - requires_text = true 的原因必须填 reason_other_text（≤255 字）
 * - 附件先走 REST 上传换 token，再随 requestReturn 提交（§3 §4）
 * - 提交按钮在请求期间禁用，防止双击重复提交
 * ---------------------------------------------------- *
 */
const useReturnOrRefund = ({route}) => {
  const navigation = useNavigation();

  const orderNumber = route?.params?.orderNumber;
  const orderUid = route?.params?.orderUid;
  const selectedProducts = route?.params?.selectedProducts || [];
  const eligibility = route?.params?.eligibility || null;

  const [modalVisible, setModalVisible] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const [form, setForm] = useState({
    solution: null,
    reason: null,
  });
  const [mediaList, setMediaList] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   * ---------------------------------------------------- *
   * @query dfiReturnOptions
   * @summary 方案 + 原因 + 媒体规则（§1）
   * ---------------------------------------------------- *
   */
  const {
    data: optionsResult,
    loading: optionsLoading,
    error: optionsError,
  } = useCustomQuery({
    schema: GET_DFI_RETURN_OPTIONS,
    useInitData: true,
    opts: {fetchPolicy: 'no-cache', context: {method: 'POST'}},
  });

  const returnOptions = _.get(optionsResult, 'data.dfiReturnOptions') || null;
  const mediaConfig = returnOptions?.media || null;

  // §2: eligibility.solutions / reason_uids 过滤（null = 不限制）
  const allowedSolutionCodes = Array.isArray(eligibility?.solutions)
    ? eligibility.solutions
    : null;
  const allowedReasonUids = Array.isArray(eligibility?.reason_uids)
    ? eligibility.reason_uids
    : null;

  const solutions = useMemo(() => {
    const all = returnOptions?.solutions || [];
    const filtered =
      allowedSolutionCodes && allowedSolutionCodes.length
        ? all.filter(item => allowedSolutionCodes.includes(item.code))
        : all;
    return filtered.map(item => ({
      id: item.code,
      name: item.label,
      reasons: item.reasons || [],
    }));
  }, [returnOptions, allowedSolutionCodes]);

  const reasons = useMemo(() => {
    const currentSolution = solutions.find(
      item => item.id === form.solution?.id,
    );
    const list = currentSolution?.reasons || [];
    const filtered =
      allowedReasonUids && allowedReasonUids.length
        ? list.filter(item => allowedReasonUids.includes(item.uid))
        : list;
    return filtered.map(item => ({
      id: item.uid,
      name: item.label,
      requires_text: item.requires_text,
    }));
  }, [solutions, form.solution, allowedReasonUids]);

  const modalData = useMemo(() => {
    if (currentModal === 'solution') {
      return {title: 'Solution', data: solutions};
    }
    if (currentModal === 'reason') {
      return {title: 'Reason', data: reasons};
    }
    return null;
  }, [currentModal, solutions, reasons]);

  // §11: Total Refund = Σ refundable_unit_price × 数量
  const totalRefund = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      const unit = Number(_.get(item, 'refundable_unit_price.value', 0)) || 0;
      return sum + unit * (Number(item.quantity_to_return) || 0);
    }, 0);
  }, [selectedProducts]);

  const totalRefundCurrency =
    _.get(selectedProducts, '[0].refundable_unit_price.currency') || 'IDR';

  const formatPrice = (value, currency = 'IDR') => {
    const price = Number(value);
    if (!Number.isFinite(price)) {
      return '-';
    }
    const prefix = currency === 'IDR' ? 'Rp' : currency;
    return numberFormat(prefix, price, '.', 0);
  };

  const onSelect = type => {
    // 原因依赖方案
    if (type === 'reason' && !form.solution) {
      return;
    }
    setModalVisible(true);
    setCurrentModal(type);
  };

  const onModalClose = () => {
    setModalVisible(false);
  };

  const onModalOk = (item, otherText) => {
    setModalVisible(false);
    setForm(prev => {
      const next = {...prev};
      next[currentModal] = {
        ...item,
        otherText:
          currentModal === 'reason' && item.requires_text
            ? otherText || null
            : null,
      };
      // 换方案后原原因失效，需要重选
      if (currentModal === 'solution') {
        next.reason = null;
      }
      return next;
    });
  };

  const onCancel = () => {
    navigation.goBack();
  };

  /**
   * ---------------------------------------------------- *
   * @function onSendRequest
   * @summary 提交退货申请（§4）：
   *          1. 前置校验方案/原因/other_text/媒体规则
   *          2. 附件并行上传换取 token（§3）
   *          3. requestReturn；错误取 errors[0].message 直接展示
   * ---------------------------------------------------- *
   */
  const onSendRequest = async () => {
    if (submitting) {
      return;
    }
    if (!form.solution) {
      rxAppSnackbar({message: 'Please choose a valid solution.'});
      return;
    }
    if (!form.reason) {
      rxAppSnackbar({
        message: 'Please choose a valid reason for this solution.',
      });
      return;
    }
    if (
      form.reason.requires_text &&
      (!form.reason.otherText || !form.reason.otherText.trim())
    ) {
      rxAppSnackbar({
        message: 'Please describe the reason (up to 255 characters).',
      });
      return;
    }

    const mediaItems = mediaConfig?.enabled ? mediaList : [];
    if (mediaConfig?.enabled) {
      const mediaError = validateMediaList(mediaItems, mediaConfig);
      if (mediaError) {
        rxAppSnackbar({message: mediaError});
        return;
      }
    }

    try {
      setSubmitting(true);

      // §3: 先上传文件换取一次性 token
      let attachmentTokens = [];
      if (mediaConfig?.enabled && mediaItems.length) {
        attachmentTokens = await uploadReturnAttachments(mediaItems);
      }

      const input = {
        order_uid: global.btoa(String(orderUid)),
        items: selectedProducts.map(item => ({
          order_item_uid: item.order_item_uid,
          quantity_to_return: Number(item.quantity_to_return) || 0,
        })),
        solution: form.solution.id,
        reason_uid: form.reason.id,
      };
      if (form.reason.requires_text && form.reason.otherText) {
        input.reason_other_text = form.reason.otherText.trim();
      }
      if (commentText && commentText.trim()) {
        input.comment_text = commentText.trim();
      }
      if (attachmentTokens.length) {
        input.attachment_tokens = attachmentTokens;
      }

      const res = await client.mutate({
        mutation: REQUEST_RETURN,
        variables: {input},
      });
      const returnUid = _.get(res, 'data.requestReturn.return.uid');

      rxAppSnackbar({
        message: 'Your return request has been submitted.',
        type: 'success',
      });
      navigateTo(modules.refund_detail.enable, modules.refund_detail.name, {
        orderNumber,
        returnUid,
      });
    } catch (err) {
      // §4: 错误在 errors[0].message，可直接展示
      const message =
        _.get(err, 'graphQLErrors[0].message') ||
        err?.message ||
        'Failed to submit the return request. Please try again.';
      rxAppSnackbar({message});
    } finally {
      setSubmitting(false);
    }
  };

  return {
    orderNumber,
    selectedProducts,
    optionsLoading,
    optionsError,
    mediaConfig,
    modalVisible,
    currentModal,
    modalData,
    form,
    mediaList,
    setMediaList,
    commentText,
    setCommentText,
    submitting,
    totalRefund,
    totalRefundCurrency,
    formatPrice,
    onSelect,
    onModalClose,
    onModalOk,
    onCancel,
    onSendRequest,
  };
};

const SelectModal = ({
  t,
  height = '25%',
  visible,
  title,
  initialValue,
  data,
  onClose,
  onOk,
  onOtherReasonChange,
}) => {
  const insets = useSafeAreaInsets();

  const [curIndex, setCurIndex] = useState(null);
  const [otherReason, setOtherReason] = useState(null);

  // §1: 当前选中原因是否 requires_text（如 "Other"）
  const requiresText = Boolean(data?.[curIndex]?.requires_text);

  useEffect(() => {
    // 每次打开弹框时重新初始化，关闭时重置
    if (!visible) {
      setCurIndex(null);
      setOtherReason(null);
      return;
    }
    if (initialValue) {
      const index = data?.findIndex(item => item.id === initialValue.id);
      setCurIndex(index >= 0 ? index : null);
      // 回显已确认的 other 文本（如 "Other" 原因的 reason_other_text）
      setOtherReason(initialValue.otherText || null);
    } else {
      setCurIndex(null);
      setOtherReason(null);
    }
  }, [visible, initialValue, data]);

  const confirmDisabled = curIndex === null || (requiresText && !otherReason);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, {height}]}>
          {/* Header */}
          <CustomView
            row
            height={44}
            horizontalCenter
            verticalCenter
            paddingHorizontal={16}
            style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <FeatherIcon name="x" size={24} color="#000000" />
            </TouchableOpacity>
          </CustomView>

          {/* Content */}
          <ScrollView
            contentContainerStyle={{paddingBottom: insets.bottom + 20}}>
            <RenderIf condition={data?.length}>
              <View style={styles.modalListContainer}>
                {data?.map((item, index) => (
                  <CustomView
                    key={index}
                    row
                    marginTop={14}
                    horizontalCenter
                    onPress={() => setCurIndex(index)}>
                    <RadioButton
                      size={18}
                      activeColor={Colors.PRIMARY}
                      selected={index === curIndex}
                      onPress={() => setCurIndex(index)}
                      style={styles.optionRadioButton}
                    />
                    <Text style={styles.optionText}>{item.name}</Text>
                  </CustomView>
                ))}
              </View>
              <RenderIf condition={requiresText}>
                <InputBox
                  value={otherReason}
                  multilines
                  maxLength={255}
                  placeholder={t(
                    'account_purchases_detail.view.reasonPlaceHolder',
                  )}
                  style={styles.otherReasonInput}
                  onChangeText={value => {
                    setOtherReason(value);
                    onOtherReasonChange?.(value);
                  }}
                />
              </RenderIf>
            </RenderIf>
          </ScrollView>
          <CustomView style={styles.modalFooter}>
            <Button
              disabled={confirmDisabled}
              width={Mixins.MAX_WIDTH * 0.9}
              borderRadius={8}
              label={t('account_purchases_detail.btn.confirm')}
              styleProp={styles.confirmButton}
              textStyleProp={styles.confirmButtonText}
              onPress={() => {
                onOk(data[curIndex], otherReason);

                setCurIndex(null);
                setOtherReason(null);
              }}
            />
          </CustomView>
        </View>
      </View>
    </Modal>
  );
};

/**
 * ---------------------------------------------------- *
 * @components ReturnOrRefundScreen
 * @summary view component for refund order screen
 * ---------------------------------------------------- *
 */
const ReturnOrRefundScreen = props => {
  const {t} = useTranslation();
  const {
    orderNumber,
    selectedProducts,
    optionsLoading,
    optionsError,
    mediaConfig,
    modalVisible,
    currentModal,
    modalData,
    form,
    setMediaList,
    commentText,
    setCommentText,
    submitting,
    totalRefund,
    totalRefundCurrency,
    formatPrice,
    onSelect,
    onModalClose,
    onModalOk,
    onCancel,
    onSendRequest,
  } = useReturnOrRefund(props);

  const totalQty = selectedProducts.reduce(
    (sum, item) => sum + (Number(item.quantity_to_return) || 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavBar
        useBack
        center
        title={t('account_purchases_detail.title.returnOrRefund')}
        stylesContainer={styles.navBarContainer}
      />
      <ScrollView style={styles.scrollView}>
        <Divider style={styles.divider} />

        <CustomView padding={14} style={styles.sectionBorder}>
          <CustomView row spaceBetween>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <RenderIf condition={Boolean(form.solution?.name)}>
              <Text style={styles.orderStatusText}>Completed</Text>
            </RenderIf>
          </CustomView>
          <CustomView row spaceBetween marginTop={12}>
            <Text style={styles.orderInfoText}>Order Number: #{orderNumber}</Text>
            <Text style={styles.orderInfoSubText}>
              {`Total of ${totalQty} item${totalQty === 1 ? '' : 's'}`}
            </Text>
          </CustomView>
        </CustomView>

        {/* Select */}
        <CustomView
          row
          spaceBetween
          paddingHorizontal={14}
          paddingVertical={12}>
          <CustomView row>
            <Text style={styles.fieldLabel}>Solution</Text>
            <Text style={styles.requiredMark}>*</Text>
          </CustomView>
          <CustomView
            flex={1}
            row
            style={{justifyContent: 'flex-end'}}
            onPress={() => onSelect('solution')}>
            <Text
              numberOfLines={1}
              style={[
                styles.selectValueText,
                form.solution && {color: '#212121'},
              ]}>
              {form.solution?.name ?? 'Select'}
            </Text>
            <FeatherIcon
              name="chevron-right"
              size={16}
              color="#757575"
              style={styles.chevronIcon}
            />
          </CustomView>
        </CustomView>
        <CustomView
          row
          spaceBetween
          paddingHorizontal={14}
          paddingVertical={12}
          style={styles.sectionBorder}>
          <CustomView row>
            <Text
              style={[
                styles.fieldLabelMuted,
                form.solution && {color: '#212121'},
              ]}>
              Reason
            </Text>
            <Text style={styles.requiredMark}>*</Text>
          </CustomView>
          <CustomView
            flex={1}
            row
            style={{justifyContent: 'flex-end'}}
            disabled={!form.solution}
            onPress={() => onSelect('reason')}>
            <Text
              numberOfLines={1}
              style={[
                styles.selectValueTextDisabled,
                form.reason
                  ? {color: '#212121'}
                  : form.solution && {color: '#8f8d8a'},
              ]}>
              {form.reason?.name ?? 'Select'}
            </Text>
            <FeatherIcon
              name="chevron-right"
              size={16}
              color={form.solution ? '#757575' : '#bdbdbd'}
              style={styles.chevronIcon}
            />
          </CustomView>
        </CustomView>

        {/* Refund */}
        <CustomView
          row
          spaceBetween
          paddingHorizontal={14}
          paddingVertical={12}
          style={styles.sectionBorder}>
          <Text style={styles.sectionTitle}>Total Refund</Text>
          <Text style={styles.totalRefundText}>
            {formatPrice(totalRefund, totalRefundCurrency)}
          </Text>
        </CustomView>

        {/* Tips */}
        <CustomView
          row
          horizontalCenter
          paddingVertical={12}
          paddingHorizontal={14}
          backgroundColor="#fafafa"
          style={[styles.sectionBorder, {gap: 4}]}>
          <FeatherIcon
            name="info"
            size={16}
            color="#757575"
            style={styles.chevronIcon}
          />
          <Text style={styles.tipsText}>
            Return/exchange orders must include the complete purchase invoice
          </Text>
        </CustomView>

        {/* Returned product */}
        <CustomView padding={14} style={styles.sectionBorder}>
          <Text style={styles.sectionTitle}>Returned product</Text>
          {selectedProducts?.map((item, index) => (
            <CustomView
              key={`${item.order_item_uid}-${index}`}
              padding={12}
              marginTop={12}
              style={[
                styles.productItemBorder,
                index === selectedProducts.length - 1 && {borderBottomWidth: 0},
              ]}>
              <CustomView row style={styles.productRow}>
                <Image
                  source={
                    item.image_url
                      ? {uri: item.image_url}
                      : require('@app/assets/images/placeholder.png')
                  }
                  style={styles.productImage}
                />
                <Text style={styles.productNameText}>{item.name}</Text>
              </CustomView>
              <CustomView row spaceBetween horizontalCenter marginTop={12}>
                <Text style={styles.productMetaLabel}>Quantity:</Text>
                <Text style={styles.productMetaValue}>
                  {`x${item.quantity_to_return}`}
                </Text>
              </CustomView>
              <CustomView row spaceBetween horizontalCenter marginTop={6}>
                <Text style={styles.productMetaLabel}>Product Value:</Text>
                <Text style={styles.productMetaValue}>
                  {formatPrice(
                    _.get(item, 'refundable_unit_price.value') *
                      (Number(item.quantity_to_return) || 0),
                    _.get(item, 'refundable_unit_price.currency', 'IDR'),
                  )}
                </Text>
              </CustomView>
            </CustomView>
          ))}
        </CustomView>

        {/* Attachment */}
        <CustomView padding={14}>
          <CustomView row>
            <Text style={styles.fieldLabelGray}>Attachment</Text>
            <RenderIf condition={Boolean(mediaConfig?.enabled)}>
              <Text style={styles.requiredMark}>*</Text>
            </RenderIf>
          </CustomView>
          <RenderIf condition={Boolean(mediaConfig?.enabled)}>
            <CustomView>
              <Text style={styles.attachmentHintText}>
                {`Video: ${
                  mediaConfig?.video_required ? 'required' : 'optional'
                }, up to ${mediaConfig?.max_video_files ?? 2} files (max ${
                  mediaConfig?.max_video_mb ?? 20
                } MB each).`}
              </Text>
              <Text style={styles.attachmentHintText}>
                {`Photos: optional, up to ${
                  mediaConfig?.max_image_files ?? 5
                } files (max ${mediaConfig?.max_image_mb ?? 5} MB each).`}
              </Text>
              <MediaUploader
                maxFiles={mediaConfig?.max_files ?? 3}
                maxVideoFiles={mediaConfig?.max_video_files ?? 2}
                maxImageFiles={mediaConfig?.max_image_files ?? 5}
                videoRequired={Boolean(mediaConfig?.video_required)}
                maxVideoMb={mediaConfig?.max_video_mb ?? 20}
                maxImageMb={mediaConfig?.max_image_mb ?? 5}
                videoExtensions={mediaConfig?.video_extensions ?? undefined}
                imageExtensions={mediaConfig?.image_extensions ?? undefined}
                onMediaChange={setMediaList}
              />
            </CustomView>
          </RenderIf>

          <CustomView marginTop={12}>
            <Text style={styles.fieldLabelGray}>Notes</Text>
            <InputBox
              multilines
              placeholder={'Enter note content'}
              style={styles.notesInput}
              value={commentText}
              onChangeText={setCommentText}
            />
          </CustomView>
        </CustomView>
      </ScrollView>
      <Divider style={styles.divider} />

      {/* Actions */}
      <CustomView
        row
        spaceBetween
        paddingHorizontal={12}
        style={styles.actionsRow}>
        <Button
          onPress={onCancel}
          label={'Cancel'}
          disabled={submitting}
          width={Mixins.MAX_WIDTH * 0.9}
          borderRadius={8}
          loadingColor={Colors.WHITE}
          styleProp={styles.actionButton}
          textStyleProp={styles.actionButtonText}
        />
        <Button
          onPress={onSendRequest}
          label={'Send Request'}
          loading={submitting}
          disabled={submitting || optionsLoading || Boolean(optionsError)}
          width={Mixins.MAX_WIDTH * 0.9}
          borderRadius={8}
          loadingColor={Colors.WHITE}
          styleProp={styles.actionButton}
          textStyleProp={styles.actionButtonText}
        />
      </CustomView>

      <SelectModal
        t={t}
        height={currentModal === 'reason' ? '40%' : '25%'}
        visible={modalVisible}
        title={modalData?.title}
        initialValue={form?.[currentModal]}
        data={modalData?.data}
        onClose={onModalClose}
        onOk={onModalOk}
      />
    </SafeAreaView>
  );
};

export default ReturnOrRefundScreen;
