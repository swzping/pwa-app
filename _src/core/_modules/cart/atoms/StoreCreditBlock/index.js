import React from 'react';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import styles from '@app/_modules/cart/atoms/StoreCreditBlock/styles';

const StoreCreditBlock = ({
  dataStoreCredit,
  onButtonPress,
  storeCreditLoading,
  dataAppliedStoreCredit,
}) => {
  const {t} = useTranslation();
  const editable = dataAppliedStoreCredit?.is_use_store_credit;
  if (
    !dataStoreCredit?.enabled ||
    dataStoreCredit?.current_balance.value <= 0
  ) {
    return null;
  }
  return (
    <CustomView style={styles.storeCreditWrapper}>
      <CustomView style={styles.storeCreditTitle}>
        <Text style={styles.storeCreditTitleText}>
          {t('cart.store_credit_block.view.storeCredit')}
        </Text>
      </CustomView>
      <CustomView style={styles.storeCreditContent}>
        <CustomView style={styles.storeCreditBox}>
          <CustomView flex horizontalStart marginVertical={10}>
            <Text>{dataStoreCredit?.current_balance.value}</Text>
          </CustomView>
          <RenderIf condition={!editable}>
            <Button
              label={t('cart.store_credit_block.label.apply')}
              styleProp={{width: 80}}
              textStyleProp={{paddingVertical: 3}}
              onPress={() => onButtonPress(true)}
              loading={storeCreditLoading}
            />
          </RenderIf>
          <RenderIf condition={editable}>
            <Button
              label={t('cart.store_credit_block.label.cancel')}
              styleProp={{width: 80}}
              textStyleProp={{paddingVertical: 3}}
              onPress={() => onButtonPress(false)}
              loading={storeCreditLoading}
            />
          </RenderIf>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default React.memo(StoreCreditBlock);
