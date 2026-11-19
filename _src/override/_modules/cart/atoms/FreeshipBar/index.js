import React, {useMemo} from 'react';
import styles from '@app/_modules/cart/atoms/FreeshipBar/style';
import RenderIf from '@app/components/RenderIf/index';
import CustomView from '@app/components/CustomView';
import TruckIcon from '@app/assets/svgs/Truck';
import Text from '@app/components/Text/index';
import {numberFormat} from '@app/helpers/General';
import {useTranslation} from 'react-i18next';
import {isNil} from 'lodash';
import Icon from 'react-native-vector-icons/AntDesign';

const FreeshipBar = props => {
  const {currency, freeshipThreshoud, cartPrice, loadingPrice} = props;

  const {t} = useTranslation();

  const barProgress = useMemo(() => {
    if (cartPrice >= freeshipThreshoud) {
      return 100;
    }
    return parseInt((cartPrice / freeshipThreshoud) * 100);
  }, [freeshipThreshoud, cartPrice]);

  const difference = useMemo(() => {
    return freeshipThreshoud - cartPrice;
  }, [freeshipThreshoud, cartPrice]);

  if (isNil(freeshipThreshoud)) {
    return null;
  }

  return (
    <CustomView style={styles.barWrap}>
      <RenderIf condition={barProgress < 100}>
        <CustomView style={styles.icon}>
          <TruckIcon />
        </CustomView>
        <CustomView style={styles.right}>
          {!loadingPrice && (
            <Text style={styles.text}>
              <Text style={styles.orangeText}>
                {numberFormat(currency, difference, ',', 2)}
              </Text>
              {t('cart.moreToGetFreeDelivery')}
            </Text>
          )}
          {loadingPrice && <Text style={styles.text}>{t('loading')}</Text>}
          <CustomView style={styles.barBack}>
            {!loadingPrice && (
              <CustomView
                style={{...styles.process, width: `${barProgress}%`}}
              />
            )}
          </CustomView>
        </CustomView>
      </RenderIf>
      <RenderIf condition={barProgress === 100}>
        <CustomView style={styles.icon}>
          <Icon name={'checkcircle'} size={14} color={'#46A147'} />
        </CustomView>
        <CustomView style={styles.right}>
          {!loadingPrice && (
            <Text style={styles.text}>{t('cart.freeDeliveryTip')}</Text>
          )}
          {loadingPrice && <Text style={styles.text}>{t('loading')}</Text>}
          <CustomView style={styles.barBack}>
            {!loadingPrice && <CustomView style={styles.processDone} />}
          </CustomView>
        </CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default FreeshipBar;
