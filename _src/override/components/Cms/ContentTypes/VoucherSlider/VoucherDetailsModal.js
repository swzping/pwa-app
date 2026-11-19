import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import RenderHTML from 'react-native-render-html';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const VoucherDetailsModal = ({visible, voucher, onClose}) => {
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 关闭按钮 */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
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
              <Text style={styles.onlineOnly}>Online Only</Text>
              <View style={styles.dateRow}>
                <Text style={styles.validDate}>
                  Valid date: {formatDate(voucher.from_date)} -{' '}
                  {formatDate(voucher.to_date)}
                </Text>
                <Text style={styles.newProduct}>{voucher.group || ''}</Text>
              </View>
            </View>

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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    height: screenHeight * 0.8,
    padding: 20,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 24,
  },
  scrollContent: {
    paddingBottom: 30,
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
  onlineOnly: {
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

export default VoucherDetailsModal;
