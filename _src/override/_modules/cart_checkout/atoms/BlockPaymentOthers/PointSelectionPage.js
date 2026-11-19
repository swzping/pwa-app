import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useNavigation} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';

import {useTranslation} from 'react-i18next';

import {GET_CMS_PAGE} from '@app/_modules/cms_page/services/schema';
import CustomView from '@app/components/CustomView';
import PointsInfoModal from '@app/components/LoyaltyCard/atoms/PointsInfoModal/index';
import Text from '@app/components/Text';
import {numberFormatBy} from '@app/helpers/General';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {
  rxAppSnackbar,
  rxCartDataPrice,
  rxSelectedPoint,
} from '@app/services/cache';
import {GET_LOYALTY_CARD_DATA} from '@app/services/queries/user';
import * as Colors from '@app/styles/colors';

const QUICK_OPTIONS = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];

const toNumber = value => {
  return parseInt(String(value)?.replace(/[^\d]/g, '')) || 0;
};

const roundDownToHundred = value => {
  const num = toNumber(value);
  return Math.floor(num / 100) * 100;
};

const rp = point => {
  return numberFormatBy('', roundDownToHundred(point));
};

const PointSelectionPage = ({route}) => {
  const balancePoint = route?.params?.balancePoint;
  const navigation = useNavigation();
  const {t} = useTranslation();
  const getRxCartPrice = useReactiveVar(rxCartDataPrice);

  const [point, setPoint] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const [selectedQuick, setSelectedQuick] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const inputRef = useRef(null);

  const {data: loyaltyCardData} = useCustomQuery({
    schema: GET_LOYALTY_CARD_DATA,
    useInitData: true,
    opts: {fetchPolicy: 'network-only'},
  });
  const cmsHomepageIdentifier =
    loyaltyCardData?.data?.storeConfig?.cms_homepage_identifer;

  const {
    data: cmsPageData,
    loading: cmsPageLoading,
    error: cmsPageError,
    onRefetchData: refetchCmsPage,
  } = useCustomQuery({
    schema: GET_CMS_PAGE,
    useInitData: false,
    variables: {identifier: cmsHomepageIdentifier},
    opts: {context: {method: 'POST'}},
  });
  const cmsPageTitle = cmsPageData?.data?.cmsPage?.title || 'About Your Points';
  const cmsPageContent = cmsPageData?.data?.cmsPage?.content || '';

  const currency = getRxCartPrice?.grand_total?.currency || 'IDR';

  const onRedeemAll = () => {
    let numericPoint = toNumber(getRxCartPrice?.grand_total?.value);
    if (numericPoint >= balancePoint) {
      numericPoint = balancePoint;
    }
    const formatted = rp(numericPoint);
    setShowTip(true);
    setSelectedQuick(null);
    setPoint(formatted);
  };

  const onChangePoint = text => {
    const rawNumber = text.replace(/[^\d]/g, '');
    const formatted = numberFormatBy('', rawNumber);

    setShowTip(!!rawNumber);
    setSelectedQuick(null);
    setPoint(formatted);
  };

  const onTapInputBox = () => {
    inputRef.current?.focus();
  };

  const onFocus = () => {
    if (point) {
      setShowTip(true);
    }
  };

  const onBlur = () => {
    onFocus();
  };

  const onQuickSelect = value => {
    inputRef.current?.blur();
    setPoint(numberFormatBy('', value));
    setSelectedQuick(value);
    setShowTip(true);
  };

  const onDismissKeyboard = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  const onConfirm = async () => {
    const numericPoint = toNumber(point);
    if (numericPoint < 100) {
      rxAppSnackbar({
        message: t('cart_checkout.error.belowMinimum', {currency}),
      });
      return;
    }
    if (numericPoint > toNumber(getRxCartPrice?.grand_total?.value)) {
      rxAppSnackbar({
        message: t('cart_checkout.error.exceedsOrderTotal'),
      });
      return;
    }
    if (numericPoint > balancePoint) {
      rxAppSnackbar({
        message: t('cart_checkout.error.insufficientPoints'),
      });
      return;
    }

    rxSelectedPoint(roundDownToHundred(point));
    navigation.goBack();
  };

  useEffect(() => {
    if (!modalVisible || !cmsHomepageIdentifier) {
      return;
    }

    refetchCmsPage({
      params: {identifier: cmsHomepageIdentifier},
      paramsOpt: {isReturn: false},
    });
  }, [modalVisible, cmsHomepageIdentifier]);

  return (
    <Pressable style={{flex: 1}} onPress={onDismissKeyboard}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('@app/assets/images/delete.png')}
              style={styles.backButton}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('cart_checkout.title.redeemPoints', {currency})}
          </Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerBg} />
          <View style={styles.headerContentNum}>
            <Text style={styles.headerContentValue}>
              {numberFormatBy('', balancePoint)}
            </Text>
            <Image
              source={require('@app/assets/images/point_icon.png')}
              style={{
                width: 24,
                height: 24,
                marginRight: 4,
              }}
            />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                source={require('@app/assets/images/warning_icon.png')}
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerContentText}>
            {t('cart_checkout.desc.redeemPoints', {currency})}
          </Text>
        </View>
        <View style={styles.content}>
          <CustomView style={styles.pointsTip}>
            <Text style={styles.pointsTipText}>
              {t('cart_checkout.title.equivalentPoints', {currency})}
            </Text>
          </CustomView>
          <View style={styles.pointsInputContainer}>
            <Image
              source={require('@app/assets/images/point_icon.png')}
              style={{
                width: 32,
                height: 32,
                marginRight: 12,
              }}
            />
            <View style={styles.pointsInputRight}>
              <View style={styles.pointsInputHeader}>
                <Text style={styles.pointsInputTitle}>
                  {t('cart_checkout.label.redeemAmount')}
                </Text>
                <TouchableOpacity
                  style={styles.redeemAllContainer}
                  onPress={onRedeemAll}>
                  <Text style={styles.redeemAll}>
                    {t('cart_checkout.btn.redeemAll')}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.pointInputBox}
                activeOpacity={1}
                onPress={onTapInputBox}>
                <TextInput
                  ref={inputRef}
                  style={styles.pointInput}
                  autoFocus={true}
                  keyboardType="number-pad"
                  selectionColor={Colors.PRIMARY}
                  value={point}
                  onChangeText={onChangePoint}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                {!point && (
                  <Text style={styles.placeholder} pointerEvents="none">
                    {t('cart_checkout.desc.redeemAmount')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              styles.pointInputTipText,
              {display: showTip ? 'flex' : 'none'},
            ]}>
            <Text style={styles.pointInputTipTextValue}>
              {t('cart_checkout.desc.equivalentPoints', {
                currency,
                amount: rp(point),
              })}
            </Text>
          </View>
          <View style={styles.pointQuickSelectionText}>
            <Text>{t('cart_checkout.label.quickSelection')}</Text>
          </View>
          <FlatList
            style={{marginTop: 8}}
            data={QUICK_OPTIONS}
            keyExtractor={(item, idx) => String(idx)}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              marginBottom: 8,
              gap: 8,
            }}
            renderItem={({item}) => {
              const isSelected = selectedQuick === item;
              return (
                <TouchableOpacity
                  style={styles.quickItem}
                  onPress={() => onQuickSelect(item)}>
                  <View
                    style={[
                      styles.quickItemBox,
                      isSelected && styles.quickItemBoxSelected,
                    ]}>
                    <Text
                      style={[
                        styles.quickItemText,
                        isSelected && styles.quickItemTextSelected,
                      ]}>
                      {numberFormatBy('', item)}
                    </Text>
                    <Image
                      source={require('@app/assets/images/point_icon.png')}
                      style={styles.quickItemIcon}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={onConfirm}>
            <Text style={styles.applyButtonText}>
              {t('cart_checkout.btn.confirm')}
            </Text>
          </TouchableOpacity>
        </View>
        <PointsInfoModal
          modalVisible={modalVisible}
          cmsPageTitle={cmsPageTitle}
          cmsPageLoading={cmsPageLoading}
          cmsPageError={cmsPageError}
          cmsPageContent={cmsPageContent}
          setModalVisible={setModalVisible}
        />
      </SafeAreaView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 16,
    height: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerRight: {
    width: 24,
  },
  headerContent: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingLeft: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFEBD6',
    zIndex: -1,
    width: '100vw',
    height: 126,
  },
  headerContentNum: {
    lineHeight: 28,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContentValue: {
    alignItems: 'flex-start',
    marginLeft: -4,
    marginRight: 2,
    fontSize: 24,
    fontWeight: 700,
  },
  headerContentText: {
    marginTop: 8,
    display: 'flex',
    fontWeight: 400,
    fontSize: 12,
    verticalAlign: 'middle',
    color: '#757575',
  },
  content: {
    marginTop: -10,
    backgroundColor: '#fff',
    zIndex: 2,
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pointsTip: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FFF8E8',
  },
  pointsTipText: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 16,
    color: '#FF8200',
  },
  pointsInputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  pointsInputRight: {
    flex: 1,
  },
  pointsInputHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsInputTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#212121',
  },
  redeemAllContainer: {
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.PRIMARY,
  },
  redeemAll: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: Colors.PRIMARY,
    fontSize: 10,
  },
  pointInputBox: {
    position: 'relative',
    justifyContent: 'center',
    marginTop: 6,
    height: 38,
  },
  placeholder: {
    position: 'absolute',
    color: '#999',
    fontSize: 12,
  },
  pointInput: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '700',
  },
  pointInputTipText: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    width: '100%',
    height: 40,
    backgroundColor: '#FFF8E8',
    borderRadius: 8,
  },
  pointInputTipTextValue: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 24,
    color: '#FF8200',
  },
  pointQuickSelectionText: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: 500,
    color: '#212121',
  },
  quickItem: {
    flex: 1,
  },
  quickItemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 74,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  quickItemBoxSelected: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  quickItemTextSelected: {
    color: Colors.PRIMARY,
  },
  quickItemText: {
    fontSize: 20,
    fontWeight: 700,
  },
  quickItemIcon: {
    width: 20,
    height: 20,
    marginLeft: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    backgroundColor: 'transparent',
  },
  applyButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
  },
});

export default PointSelectionPage;
