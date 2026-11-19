import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Barcode from 'react-native-barcode-qr-generator';
import {CaptureProtection} from 'react-native-capture-protection';
import RenderHTML from 'react-native-render-html';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useFocusEffect, useRoute} from '@react-navigation/native';

import {useLazyQuery} from '@apollo/client';

import {useTranslation} from 'react-i18next';

import {markOfflineListRefresh} from '@app/_modules/account_mycoupon/_offlineListRefresh';
import NavBar from '@app/components/NavBar';
import {GET_OFFLINE_VOUCHER} from '@app/services/queries/couponWallet';

const {width: screenWidth} = Dimensions.get('window');

const VoucherDetailScreen = () => {
  const {t} = useTranslation();
  const route = useRoute();
  const uid = route?.params?.uid;
  const voucherStatus = route?.params?.voucherStatus;

  const [fetchVoucher, {data, loading}] = useLazyQuery(GET_OFFLINE_VOUCHER, {
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (uid) {
      fetchVoucher({variables: {uid}});
    }
  }, [fetchVoucher, uid]);

  // 防截屏:仅 valid(展示条形码)的券开启,其余状态无敏感条形码,允许截屏。
  // 平台能力为整窗级(Android FLAG_SECURE / iOS 系统遮蔽),无法只覆盖条形码区域,
  // 故随页面焦点启停,离开页面即解除
  useFocusEffect(
    React.useCallback(() => {
      if (voucherStatus === 'valid') {
        CaptureProtection.prevent({screenshot: true, record: true});
      }
      return () => {
        CaptureProtection.allow();
        // 离开详情页:通知 MyVoucher 列表返回时刷新(核销状态可能已变化)
        voucherStatus === 'valid' && markOfflineListRefresh();
      };
    }, [voucherStatus]),
  );

  const voucher = data?.offlineVoucher;

  if (!uid || loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavBar useBack useWhite center title={t('account_mycoupon.voucherDetails')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8200" />
        </View>
      </SafeAreaView>
    );
  }

  if (!voucher) {
    return null;
  }

  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavBar useBack useWhite center title={t('account_mycoupon.voucherDetails')} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
            {/* 优惠券图标和类型 */}
            <View style={styles.voucherHeader}>
              {voucher.image &&
              Array.isArray(voucher.image) &&
              voucher.image.length > 0 ? (
                <Image
                  source={{uri: voucher.image[0]}}
                  style={styles.voucherImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.voucherIcon}>
                  <Text style={styles.percentageSymbol}>%</Text>
                </View>
              )}
            </View>

            {/* 折扣金额 */}
            <Text style={styles.discountAmount}>{voucher.name || ''}</Text>

            {/* 产品详情框 */}
            <View style={styles.offerDetailsBox}>
              <Text style={styles.productDescription}>
                {voucher.description || ''}
              </Text>
              <Text style={styles.offlineOnly}>Offline Only</Text>
              <View style={styles.dateRow}>
                <Text style={styles.validDate}>
                  Valid date: {formatDate(voucher.from_date)} -{' '}
                  {formatDate(voucher.to_date)}
                </Text>
                <Text style={styles.newProduct}>{voucher.group || ''}</Text>
              </View>
            </View>

            {/* 条形码：由 voucher code 生成，供线下扫码核销 */}
            {voucher.code && voucherStatus === 'valid' ? (
              <View style={styles.barcodeSection}>
                <View style={styles.barcodeHeader}>
                  <Text style={styles.barcodeTitle}>Voucher Code</Text>
                </View>
                <Barcode
                  value={voucher.code}
                  format="CODE128"
                  width={2}
                  maxWidth={screenWidth - 96}
                  height={100}
                  lineColor="#000000"
                  background="#FFFFFF"
                />
                <Text style={styles.barcodeText}>Present to store staff · One-time use only</Text>
              </View>
            ) : null}

            {/* 条款和条件 */}
            <View style={styles.termsSection}>
              {voucher.t_and_c ? (
                <RenderHTML
                  contentWidth={screenWidth - 40}
                  source={{html: voucher.t_and_c}}
                  tagsStyles={{
                    p: {
                      fontSize: 14,
                      margin: 0,
                      padding: 0,
                      marginBottom: 8,
                    },
                    ul: {
                      margin: 0,
                      padding: 0,
                      paddingLeft: 20,
                    },
                    li: {
                      fontSize: 14,
                      margin: 0,
                      padding: 0,
                      marginBottom: 4,
                    },
                    br: {
                      margin: 0,
                    },
                    span: {
                      margin: 0,
                      padding: 0,
                    },
                    strong: {
                      fontWeight: 'bold',
                    },
                  }}
                  baseStyle={{
                    fontSize: 12,
                    color: '#666666',
                  }}
                />
              ) : (
                <Text style={styles.termsText}>
                  No terms and conditions available.
                </Text>
              )}
            </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  barcodeSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  barcodeHeader: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  barcodeTitle: {
    marginBottom: 18,
    fontSize: 12,
    color: '#212121',
    fontWeight: '700',
  },
  barcodeText: {
    fontSize: 12,
    color: '#000',
    marginTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 13,
    right: 20,
    zIndex: 1,
    // padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 36,
    color: '#000',
    fontWeight: 'normal',
    textAlign: 'center',
    lineHeight: 30,
  },
  voucherHeader: {
    alignItems: 'center',
    // marginTop: 20,
    marginBottom: 8,
  },
  voucherIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#FF8200',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 8,
  },
  voucherImage: {
    width: 80,
    height: 80,
    // borderRadius: 8,
    // marginBottom: 10,
  },
  percentageSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  voucherType: {
    fontSize: 14,
    color: '#FF8200',
    fontWeight: '600',
  },
  discountAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF8200',
    textAlign: 'center',
    marginBottom: 12,
  },
  offerDetailsBox: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  productDescription: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'left',
    lineHeight: 20,
  },
  offlineOnly: {
    color: '#666666',
    fontSize: 12,
    paddingVertical: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validDate: {
    fontSize: 13,
    color: '#666666',
  },
  newProduct: {
    fontSize: 12,
    color: '#666666',
  },
  termsSection: {
    marginBottom: 20,
    paddingVertical: 10,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 16,
  },
  generalSection: {
    marginBottom: 20,
  },
  generalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  generalText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 16,
  },
});

export default VoucherDetailScreen;
