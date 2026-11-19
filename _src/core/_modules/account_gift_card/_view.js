import Button from '@app/components/Button';
import Input from '@app/components/Input';

import Appbar from '@app/components/AppBar';

import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {numberFormat} from '@app/helpers/General';

import React, {useState} from 'react';
import CustomView from '@app/components/CustomView';
import {ActivityIndicator} from 'react-native-paper';

import styles from '@app/_modules/account_gift_card/styles';

function Views({
  t,
  onCheckStatusAndBalance,
  giftCardAccount,
  loading,
  isChecked,
}) {
  const [giftCardCode, setGiftCardCode] = useState('');

  // TODO : Styling & asked for code with expiration date
  const checkAvilability = expiration_date => {
    const ACTIVE = 'Active';
    const INACTIVE = 'Inactive';

    if (!expiration_date) {
      return ACTIVE;
    }

    let expDate = expiration_date.split(' ')[0].split('-');
    let newDate = new Date(expDate[2], expDate[1] - 1, expDate[0]);
    const expTimeStamp = newDate.getTime();

    if (Date.now() > expTimeStamp) {
      return INACTIVE;
    }

    return ACTIVE;
  };

  const GiftCardInformation = ({giftCardAccountResult}) => {
    return (
      <CustomView style={styles.sectionContainer}>
        <CustomView style={styles.fieldContainer}>
          <Text>{t('account_gift_card.view.code')}</Text>
          <Text>{giftCardAccountResult.code}</Text>
        </CustomView>
        <CustomView style={styles.fieldContainer}>
          <Text>{t('account_gift_card.view.availability')}</Text>
          <Text>{checkAvilability(giftCardAccountResult.expiration_date)}</Text>
        </CustomView>
        <CustomView style={styles.fieldContainer}>
          <Text>{t('account_gift_card.view.balance')}</Text>
          <Text>{numberFormat('IDR', giftCardAccountResult.balance)}</Text>
        </CustomView>
      </CustomView>
    );
  };

  return (
    <>
      <Appbar useBack title={t('account_gift_card.title.giftCard')} />
      <CustomView style={styles.mainContainer}>
        <RenderIf condition={giftCardAccount && !loading}>
          <GiftCardInformation giftCardAccount={giftCardAccount} />
        </RenderIf>
        <RenderIf condition={loading}>
          <CustomView style={styles.sectionContainer}>
            <ActivityIndicator />
          </CustomView>
        </RenderIf>
        <RenderIf condition={!loading && isChecked && !giftCardAccount}>
          <CustomView style={[styles.sectionContainer, {alignItems: 'center'}]}>
            <Text>{t('account_gift_card.view.giftCardNotFound')}</Text>
            <Text>{t('account_gift_card.view.pleaseTryAnotherCode')}</Text>
          </CustomView>
        </RenderIf>
        <Input
          label={t('account_gift_card.label.enterGiftCard')}
          value={giftCardCode}
          onChangeText={setGiftCardCode}
        />
        <Button
          label={t('account_gift_card.btn.checkStatus')}
          styleProp={styles.checkButton}
          onPress={() => onCheckStatusAndBalance(giftCardCode)}
        />
      </CustomView>
    </>
  );
}

export default Views;
