import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';

import {Divider, MD2Colors} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';

import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import CheckBox from '@app/_modules/product_list/atoms/Checkbox';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import {numberFormat} from '@app/helpers/General';
import {navigateTo} from '@app/helpers/Navigation';
import {Colors, Mixins} from '@app/styles';

import ProductItem from './atoms/ProductItem';

/**
 * ---------------------------------------------------- *
 * @hooks useReturnedProduct
 * @summary 选择要退货的商品（数据来自订单详情页 §2 §11）：
 *          - products: route.params.orderItems（含 returnable_quantity /
 *            refundable_unit_price / 图片）
 *          - returnable_quantity = 0 的商品不可勾选（§2：disable）
 *          - 数量 1 ~ returnable_quantity
 * ---------------------------------------------------- *
 */
const useReturnedProduct = ({route}) => {
  const orderItems = route?.params?.orderItems || [];

  const [products] = useState(orderItems);
  const [selectedMap, setSelectedMap] = useState({});
  const [quantityMap, setQuantityMap] = useState({});

  const selectedCount = useMemo(() => {
    return Object.keys(selectedMap).length;
  }, [selectedMap]);

  const selectableProducts = useMemo(() => {
    return products.filter(item => Number(item.returnable_quantity) > 0);
  }, [products]);

  const selectAll = useMemo(() => {
    return (
      selectableProducts.length > 0 &&
      selectableProducts.every(item => selectedMap[item.id])
    );
  }, [selectableProducts, selectedMap]);

  /**
   * ---------------------------------------------------- *
   * @function formatPrice
   * @summary 金额格式化（IDR → Rp 千分位）
   * ---------------------------------------------------- *
   */
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
   * @function getRefundByQty
   * @summary Est. Refund = refundable_unit_price × 已选数量（§11）
   * ---------------------------------------------------- *
   */
  const getRefundByQty = (item, quantity) => {
    const unit = Number(_.get(item, 'refundable_unit_price.value', 0) || 0);
    const currency = _.get(item, 'refundable_unit_price.currency', 'IDR');
    return formatPrice(unit * (Number(quantity) || 0), currency);
  };

  /**
   * ---------------------------------------------------- *
   * @function onSelectAll
   * @summary toggle select all products / clear all selection
   * ---------------------------------------------------- *
   */
  const onSelectAll = nextChecked => {
    setSelectedMap(() => {
      if (!nextChecked) {
        return {};
      }
      const allSelected = {};
      selectableProducts.forEach(item => {
        allSelected[item.id] = true;
      });
      return allSelected;
    });

    setQuantityMap(() => {
      if (!nextChecked) {
        return {};
      }
      const allQuantity = {};
      selectableProducts.forEach(item => {
        allQuantity[item.id] = item.returnable_quantity;
      });
      return allQuantity;
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onToggleItem
   * @summary free selection, toggle single product checked state
   * @param {Object} item product to toggle
   * @param {Boolean} nextChecked next checked state from checkbox
   * ---------------------------------------------------- *
   */
  const onToggleItem = (item, nextChecked) => {
    // §2: returnable_quantity = 0 的商品不可选
    if (Number(item.returnable_quantity) <= 0) {
      return;
    }
    setSelectedMap(prev => {
      const next = {...prev};
      if (nextChecked) {
        next[item.id] = true;
      } else {
        delete next[item.id];
      }
      return next;
    });

    setQuantityMap(prev => {
      const next = {...prev};
      next[item.id] = nextChecked ? Number(item.returnable_quantity) : 0;
      return next;
    });
  };

  const onSetQuantity = (item, quantity) => {
    if (Number(quantity) <= 0) {
      onToggleItem(item, false);
    } else {
      setQuantityMap(prev => {
        const next = {...prev};
        next[item.id] = quantity;
        return next;
      });
    }
  };

  const onNext = () => {
    // §4: 提交给表单页的商品（order_item_uid + quantity_to_return）
    const selectedProducts = products
      .filter(item => selectedMap[item.id])
      .map(item => ({
        order_item_uid: item.id,
        quantity_to_return: Number(quantityMap[item.id]) || 0,
        name: item.name,
        image_url: item.image_url,
        refundable_unit_price: item.refundable_unit_price,
      }));

    navigateTo(modules.return_or_refund.enable, modules.return_or_refund.name, {
      orderNumber: route?.params?.orderNumber,
      orderUid: route?.params?.orderUid,
      paymentMethod: route?.params?.paymentMethod,
      eligibility: route?.params?.eligibility,
      selectedProducts,
    });
  };

  return {
    products,
    selectedMap,
    quantityMap,
    selectedCount,
    selectAll,
    formatPrice,
    getRefundByQty,
    onSelectAll,
    onToggleItem,
    onSetQuantity,
    onNext,
  };
};

const ReturnedProductScreen = props => {
  const {t} = useTranslation();
  const {
    products,
    selectedMap,
    quantityMap,
    selectedCount,
    selectAll,
    formatPrice,
    getRefundByQty,
    onSelectAll,
    onToggleItem,
    onSetQuantity,
    onNext,
  } = useReturnedProduct(props);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavBar
        useBack
        center
        title={t('account_purchases_detail.title.returnedProduct')}
        stylesContainer={styles.navBarContainer}
      />
      <ScrollView style={styles.scrollView}>
        <CustomView style={styles.warningBanner}>
          <LocalSvg
            asset={require('@app/assets/svg/info.svg')}
            style={styles.warningIcon}
          />
          <Text style={styles.warningText}>
            If you have several products to return, please send all products in
            one shipment.
          </Text>
        </CustomView>
        <CustomView row horizontalCenter marginTop={24} paddingHorizontal={12}>
          <CheckBox
            uncheckedColor={'#969696'}
            checkedColor={Colors.PRIMARY}
            onPress={onSelectAll}
            checkedSize={18}
            size={20}
            radius={4}
            selected={selectAll}
            style={styles.containerCheck}
          />
          <Text style={styles.selectAll}>
            {`Select All (${selectedCount}/${products.length})`}
          </Text>
        </CustomView>
        <CustomView paddingHorizontal={12}>
          {products.map((item, index) => {
            const qty = quantityMap[item.id] || 0;
            const unitPrice = _.get(item, 'refundable_unit_price.value');

            return (
              <React.Fragment key={item.id ?? index}>
                <ProductItem
                  t={t}
                  item={{
                    ...item,
                    name: item.name,
                    price: formatPrice(unitPrice),
                    qty: item.quantity_ordered,
                    estRefund: getRefundByQty(item, qty),
                    promo_id: item.is_gwp ? 'gwp' : item.promo_id,
                  }}
                  initialQty={qty}
                  maxQty={Number(item.returnable_quantity) || 0}
                  selected={Boolean(selectedMap[item.id])}
                  onChangeCheckBox={nextChecked =>
                    onToggleItem(item, nextChecked)
                  }
                  onChangeQuantity={nextQty => onSetQuantity(item, nextQty)}
                />
                <RenderIf condition={index < products.length - 1}>
                  <Divider style={styles.itemDivider} />
                </RenderIf>
              </React.Fragment>
            );
          })}
        </CustomView>
      </ScrollView>
      <Divider style={styles.divider} />
      <Button
        disabled={selectedCount === 0}
        onPress={onNext}
        label={'Next'}
        width={Mixins.MAX_WIDTH * 0.9}
        borderRadius={8}
        loadingColor={Colors.WHITE}
        styleProp={[
          styles.nextButton,
          selectedCount === 0 && styles.nextButtonDisabled,
        ]}
        textStyleProp={[
          styles.nextButtonText,
          selectedCount === 0 && styles.nextButtonTextDisabled,
        ]}
      />
    </SafeAreaView>
  );
};

export default ReturnedProductScreen;

const styles = StyleSheet.create({
  /* --- Screen layout --- */
  container: {
    flex: 1,
  },
  navBarContainer: {
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    marginBottom: 24,
  },
  divider: {
    height: 2,
    backgroundColor: MD2Colors.grey200,
  },
  itemDivider: {
    height: 1,
    backgroundColor: MD2Colors.grey200,
  },

  /* --- Warning banner --- */
  warningBanner: {
    height: 70,
    backgroundColor: '#757575',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
  },
  warningIcon: {
    margin: 2,
  },
  warningText: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
  },

  /* --- Select all --- */
  containerCheck: {
    marginRight: 10,
    borderWidth: 1.5,
  },
  selectAll: {
    fontWeight: '400',
    fontSize: 12,
    color: '#757575',
  },

  /* --- Actions --- */
  nextButton: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    height: 48,
    marginTop: 8,
    backgroundColor: Colors.PRIMARY,
  },
  nextButtonDisabled: {
    backgroundColor: '#e5e5e5',
  },
  nextButtonText: {
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#969696',
  },
});
