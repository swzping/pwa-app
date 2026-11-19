import React from 'react';
import {TouchableOpacity} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {rxAppSnackbar} from '@app/services/cache';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

import RadioButton from '@app/components/RadioButton';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome';

import styles from '@app/_modules/cart/atoms/ShippingMethodBlock/styles';
import {useTranslation} from 'react-i18next';

const ShippingMethodBlock = ({
  selectedShippingAddress,
  availableShippingMethods,
  selectedShippingMethod,
  onSelectShippingMethod,
  shippingMethodLoading,
  activeSections,
  updateSections,
}) => {
  const {t} = useTranslation();
  const selectedStatus = item => {
    if (
      selectedShippingMethod.amount === item.amount.value &&
      selectedShippingMethod.carrier_code === item.carrier_code &&
      selectedShippingMethod.carrier_title === item.carrier_title &&
      selectedShippingMethod.method_code === item.method_code &&
      selectedShippingMethod.method_title === item.method_title
    ) {
      return true;
    } else {
      return false;
    }
  };

  const ShippingMethodItem = ({childItem}) => {
    const ItemPriceLabel = ({item}) => {
      if (item.amount.value === item.price_incl_tax.value) {
        return (
          <Text>
            {item.amount.currency} {item.amount.value}
          </Text>
        );
      } else {
        return (
          <>
            <Text lineThrough>
              {item.price_incl_tax.currency} {item.price_incl_tax.value}
            </Text>
            <Text>
              {item.amount.currency} {item.amount.value}
            </Text>
          </>
        );
      }
    };

    let itemLabel = childItem.carrier_title
      ? childItem.carrier_title + ' ' + childItem.method_title
      : childItem.method_title;

    itemLabel = childItem.shipping_promo_name
      ? itemLabel + ` (${childItem.shipping_promo_name})`
      : itemLabel;

    return (
      <TouchableOpacity
        onPress={() => {
          if (!selectedShippingAddress) {
            rxAppSnackbar({
              message: t(
                'cart.shipping_method_block.message.selectShippingAddress',
              ),
            });
          } else {
            onSelectShippingMethod(childItem);
          }
          onSelectShippingMethod(childItem);
        }}
        style={styles.itemContainer}>
        <RadioButton
          selected={selectedShippingMethod ? selectedStatus(childItem) : false}
        />
        <CustomView style={styles.textShippingGroupingContentLabelWrapper}>
          <Text style={styles.textShippingGroupingContentLabel}>
            {itemLabel}
          </Text>
          <CustomView>
            <ItemPriceLabel item={childItem} />
          </CustomView>
        </CustomView>
      </TouchableOpacity>
    );
  };

  //eslint-disable-next-line no-shadow
  const renderHeader = (section, index, activeSections, sections) => {
    if (section.value.length > 0) {
      return (
        <CustomView
          row
          paddingVertical={5}
          width={'100%'}
          style={[
            styles.headerBlockStyle,
            index === availableShippingMethods.length - 1
              ? {borderBottomWidth: 0}
              : {},
          ]}>
          <CustomView width={45}>
            <Icon
              name={section.icon}
              size={normalize(20)}
              color={Colors.GRAY_DARK}
              style={{alignSelf: 'center'}}
            />
          </CustomView>
          <CustomView style={styles.textShippingGroupingHeaderLabelWrapper}>
            <Text style={styles.textShippingGrouping}>{section.title}</Text>
            <CustomView width={45}>
              <Icon
                name={activeSections ? 'chevron-down' : 'chevron-right'}
                size={normalize(12)}
                color={'black'}
                style={{alignSelf: 'flex-end', paddingRight: 15}}
              />
            </CustomView>
          </CustomView>
        </CustomView>
      );
    }
    return null;
  };

  const renderContent = section => {
    return section.value.map((childItem, index) => {
      return (
        <ShippingMethodItem
          key={`${childItem.code}${index}`}
          childItem={childItem}
          index={index}
          style={{width: '100%'}}
        />
      );
    });
  };

  const RenderContainer = () => {
    // if loading === true
    if (shippingMethodLoading) {
      return (
        <CustomView
          horizontalCenter
          verticalCenter
          border={1}
          borderColor={Colors.GRAY_MEDIUM}
          borderRadius={15}
          paddingVertical={15}
          marginVertical={15}>
          <ActivityIndicator />
        </CustomView>
      );
    }

    // if selectedShippingAddress is not undefined and
    // selectedShippingAddress data is more than 1
    if (
      selectedShippingAddress &&
      Object.keys(availableShippingMethods).length
    ) {
      return (
        <Accordion
          sections={availableShippingMethods}
          activeSections={activeSections}
          renderHeader={renderHeader}
          renderContent={renderContent}
          touchableComponent={TouchableOpacity}
          onChange={updateSections}
        />
      );
    } else {
      return (
        <CustomView
          style={{backgroundColor: 'white', padding: 15, borderRadius: 8}}>
          <Text style={{fontSize: 14}} center>
            {t('cart.shipping_method_block.view.selectShippingAddress')}
          </Text>
        </CustomView>
      );
    }
  };

  return (
    <CustomView style={{width: '100%', marginBottom: 35}}>
      <CustomView style={{paddingVertical: 15}}>
        <Text style={{fontWeight: '500', fontSize: 14}}>
          {t('cart.shipping_method_block.view.shippingMethod')}
        </Text>
      </CustomView>
      <CustomView style={{borderRadius: 8, overflow: 'hidden'}}>
        {RenderContainer()}
      </CustomView>
    </CustomView>
  );
};

export default ShippingMethodBlock;
