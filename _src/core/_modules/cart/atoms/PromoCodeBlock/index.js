import React, {useState} from 'react';
import {normalize} from '@app/styles/mixins';
import CustomView from '@app/components/CustomView';
import Button from '@app/components/Button';
import Input from '@app/components/Input';
import RenderIf from '@app/components/RenderIf';
import {Text} from 'react-native-paper';
import styles from '@app/_modules/cart/atoms/PromoCodeBlock/styles';
import {useTranslation} from 'react-i18next';

const PromoCodeBlock = ({
  dataAppliedCoupons,
  onButtonPress,
  couponsLoading,
}) => {
  const {t} = useTranslation();
  const editable = dataAppliedCoupons?.code ? false : true;
  const [code, setCode] = useState(dataAppliedCoupons?.code || '');
  return (
    <CustomView style={styles.promoWrapper}>
      <CustomView style={styles.promoTitle}>
        <Text style={styles.titleText}>
          {t('cart.promo_code_block.view.promoCode')}
        </Text>
        <Text style={styles.titleDescription}>
          {t('cart.promo_code_block.view.promoCodeIfHave')}
        </Text>
      </CustomView>
      <CustomView style={styles.promoContent}>
        <CustomView style={styles.promoBox}>
          <Input
            styleProp={styles.promoInput}
            textStyleProp={styles.promoInputText}
            value={code}
            editable={editable}
            onChangeText={text => setCode(text)}
            placeholder={t('cart.promo_code_block.placeholder.promoCode')}
          />
          <RenderIf condition={editable}>
            <Button
              label={t('cart.promo_code_block.label.apply')}
              styleProp={{
                width: normalize(80),
              }}
              textStyleProp={{
                paddingVertical: normalize(3),
              }}
              onPress={() => onButtonPress(code, true)}
              loading={couponsLoading}
            />
          </RenderIf>
          <RenderIf condition={!editable}>
            <Button
              label={t('cart.promo_code_block.label.cancel')}
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
              loading={couponsLoading}
            />
          </RenderIf>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default React.memo(PromoCodeBlock);
