import React from 'react';
import {TouchableOpacity} from 'react-native';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import styles from '@app/_modules/main_home/atoms/newFeatureGuider/styles';
import {useTranslation} from 'react-i18next';
import IconFeather from 'react-native-vector-icons/Feather';
import {isIOS} from '@app/styles/mixins.new';

export const ScannerGuider = props => {
  const {onScanGuideClose} = props;
  const {t} = useTranslation();

  const content = (
    <CustomView style={styles.scanWrap}>
      <CustomView style={styles.scanContent}>
        <TouchableOpacity style={styles.closeBtn} onPress={onScanGuideClose}>
          <IconFeather name="x" color="black" size={18} />
        </TouchableOpacity>
        <CustomView style={styles.triangle} />
        <Text style={styles.scanTitle}>{t('guider.newFeatureTitle')}</Text>
        <Text style={styles.scanText}>{t('guider.scannerGuider')}</Text>
      </CustomView>
    </CustomView>
  );

  return isIOS ? (
    <CustomView style={styles.container}>{content}</CustomView>
  ) : (
    content
  );
};
