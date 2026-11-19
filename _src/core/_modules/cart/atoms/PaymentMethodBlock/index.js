import React from 'react';
import {TouchableOpacity} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomView from '@app/components/CustomView';
import RadioButton from '@app/components/RadioButton';
import {Text} from 'react-native';

import styles from '@app/_modules/cart/atoms/PaymentMethodBlock/styles';
import {useTranslation} from 'react-i18next';

const PaymentMethodBlock = ({
  availablePaymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  activeSections,
  updateSections,
}) => {
  const {t} = useTranslation();
  const selectedStatus = item => {
    if (
      selectedPaymentMethod &&
      selectedPaymentMethod.title === item.title &&
      selectedPaymentMethod.code === item.code
    ) {
      return true;
    } else {
      return false;
    }
  };

  const PaymentMethodItem = ({method, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onSelectPaymentMethod(method);
        }}
        style={styles.itemContainer}>
        <CustomView style={{alignItems: 'center', flexDirection: 'row'}}>
          <RadioButton
            selected={
              selectedPaymentMethod && selectedPaymentMethod.title !== ''
                ? selectedStatus(method)
                : false
            }
          />
          <Text style={styles.paymentItemText}>{method.title}</Text>
        </CustomView>
      </TouchableOpacity>
    );
  };

  //eslint-disable-next-line no-shadow
  const renderHeader = (section, index, activeSections) => {
    if (section.value.length > 0) {
      return (
        <CustomView style={styles.headerBlockStyle} key={index}>
          <CustomView style={styles.headerBlockContentStyle}>
            <CustomView style={{width: 40}}>
              <Icon
                name={section.icon}
                size={normalize(25)}
                color={Colors.GRAY_DARK}
                style={{alignSelf: 'center'}}
              />
            </CustomView>
            <Text large bold style={styles.paymentGroupingText}>
              {section.title}
            </Text>
          </CustomView>
          <Icon
            name={activeSections ? 'chevron-down' : 'chevron-right'}
            size={normalize(14)}
            color={'black'}
            style={{alignSelf: 'center'}}
          />
        </CustomView>
      );
    }
    return null;
  };

  const renderContent = section => {
    return section.value.map((method, index) => {
      return (
        <PaymentMethodItem
          key={`${method.code}${index}`}
          method={method}
          index={index}
        />
      );
    });
  };

  return (
    <CustomView style={styles.checkoutPaymentWrapper}>
      <CustomView style={styles.checkoutPaymentTitle}>
        <Text style={styles.paymentTitle}>Payment</Text>
        <Text style={styles.paymentDescription}>
          {t('cart.payment_method_block.view.selectPaymentMethod')}
        </Text>
      </CustomView>
      <CustomView style={styles.checkoutPaymentContent}>
        {availablePaymentMethods &&
        Object.keys(availablePaymentMethods).length ? (
          <Accordion
            sections={availablePaymentMethods}
            activeSections={activeSections}
            renderHeader={renderHeader}
            renderContent={renderContent}
            touchableComponent={TouchableOpacity}
            onChange={updateSections}
          />
        ) : (
          <ActivityIndicator />
        )}
      </CustomView>
    </CustomView>
  );
};

export default React.memo(PaymentMethodBlock);
