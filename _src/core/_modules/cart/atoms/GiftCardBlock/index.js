import React, {useState} from 'react';
import {Text} from 'react-native-paper';
import {normalize} from '@app/styles/mixins';

import CustomView from '@app/components/CustomView';
import Button from '@app/components/Button';
import Input from '@app/components/Input';
import RenderIf from '@app/components/RenderIf';

import styles from '@app/_modules/cart/atoms/GiftCardBlock/styles';
import {useTranslation} from 'react-i18next';

const GiftCardBlock = ({appliedGiftCard, onButtonPress, giftCardLoading}) => {
  const {t} = useTranslation();
  const editable = appliedGiftCard?.giftcard_detail[0]?.giftcard_amount_used
    ? false
    : true;
  const [code, setCode] = useState(
    appliedGiftCard?.giftcard_detail[0]?.giftcard_code || '',
  );

  return (
    <CustomView style={styles.giftCardWrapper}>
      <CustomView style={styles.giftCardTitle}>
        <Text style={styles.titleText}>
          {t('cart.gift_card_block.view.giftCard')}
        </Text>
        <Text style={styles.titleDescription}>
          {t('cart.gift_card_block.view.giftCodeIfHave')}
        </Text>
      </CustomView>
      <CustomView style={styles.giftCardContent}>
        <CustomView style={styles.giftCardBox}>
          <Input
            styleProp={styles.promoInput}
            textStyleProp={styles.promoInputText}
            value={code}
            editable={editable}
            onChangeText={text => setCode(text)}
            placeholder={t('cart.gift_card_block.placeholder.giftCard')}
          />
          <RenderIf condition={editable}>
            <Button
              label={t('cart.gift_card_block.label.apply')}
              styleProp={{
                width: normalize(80),
              }}
              textStyleProp={{
                paddingVertical: normalize(3),
              }}
              onPress={() => onButtonPress(code, true)}
              loading={giftCardLoading}
            />
          </RenderIf>
          <RenderIf condition={!editable}>
            <Button
              label={t('cart.gift_card_block.label.cancel')}
              styleProp={{
                width: normalize(80),
              }}
              textStyleProp={{
                paddingVertical: normalize(3),
              }}
              onPress={() => {
                onButtonPress(code, false);
                setCode('');
              }}
              loading={giftCardLoading}
            />
          </RenderIf>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default React.memo(GiftCardBlock);
