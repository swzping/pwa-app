import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_GIFT_CARD_ACCOUNT} from '@app/_modules/account_gift_card/services/schema';
import Views from '@app/_modules/account_gift_card/_view';
import {modules} from '@root/swift.config';

const Controller = () => {
  if (!modules.account_gift_card.enable) {
    return null;
  }

  const {t} = useTranslation();
  const [giftCardAccount, setGiftCardAccount] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const {data: giftCardAccountData, onRefetchData: loadGetGiftCardAccount} =
    useCustomQuery({schema: GET_GIFT_CARD_ACCOUNT});

  const onCheckStatusAndBalance = async giftCardCode => {
    if (giftCardCode && giftCardCode !== '') {
      try {
        setIsChecked(true);
        await loadGetGiftCardAccount({
          params: {
            giftCardCode,
          },
        });
      } catch (error) {
        // console.log('ERROR', error);
      }
    }
  };

  useEffect(() => {
    if (giftCardAccountData?.data) {
      setGiftCardAccount(giftCardAccountData?.data.giftCardAccount);
    }
  }, [giftCardAccountData]);

  return (
    <Views
      t={t}
      onCheckStatusAndBalance={onCheckStatusAndBalance}
      giftCardAccount={giftCardAccount}
      loading={giftCardAccountData.loading}
      isChecked={isChecked}
    />
  );
};

export default Controller;
