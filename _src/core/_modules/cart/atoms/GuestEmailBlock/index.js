import React, {useState} from 'react';
import {Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {useTranslation} from 'react-i18next';
import styles from '@app/_modules/cart/atoms/GuestEmailBlock/styles';

import CustomView from '@app/components/CustomView';
import Button from '@app/components/Button';
import Text from '@app/components/Text';
import Input from '@app/components/Input';

const GuestEmailBlock = ({onSetGuestEmail, isEmailFilled}) => {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');

  return (
    <CustomView style={styles.guestEmail}>
      <CustomView style={styles.guestEmailTitle}>
        <Text style={{fontSize: 14, fontWeight: '500'}}>
          {t('cart.guest_email_block.view.guestEmail')}
        </Text>
      </CustomView>
      <CustomView style={styles.guestEmailContent}>
        <CustomView style={styles.inputContainer}>
          <Input
            styleProp={{
              width: Mixins.MAX_WIDTH * 0.5,
            }}
            textStyleProp={{
              height: normalize(40),
            }}
            value={email}
            onChangeText={setEmail}
            placeholder={t('cart.guest_email_block.placeholder.email')}
          />
          <Button
            label={isEmailFilled ? t('label.change') : t('label.submit')}
            styleProp={{
              width: normalize(80),
            }}
            onPress={() => onSetGuestEmail(email)}
          />
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default GuestEmailBlock;
