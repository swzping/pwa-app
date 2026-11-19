import React, {useRef} from 'react';
import {Modal, StyleSheet,View} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';

import {useTranslation} from 'react-i18next';

import CustomView from '@app/components/CustomView/index';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf/index';
import {IS_IOS} from '@app/helpers/Constants';
import {Colors} from '@app/styles/index';
import {MAX_HEIGHT} from '@app/styles/mixins.new';

const styles = StyleSheet.create({
  displayFlex: {
    flex: MAX_HEIGHT,
  },
  loadingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ModalPaymentSnap = ({
  show,
  snapPaymentUrl,
  showWebviewLoader,
  onWebviewLoad,
  onWebviewClose,
  onWebviewError,
  onWebviewNavigationStateChange,
}) => {
  const {t} = useTranslation();
  const webviewRef = useRef();
  const safeStyle = IS_IOS ? {height: MAX_HEIGHT + 50} : {flex: 1};
  const webviewStyle = {
    top: IS_IOS ? -50 : 0,
    position: 'relative',
  };

  if (!snapPaymentUrl || snapPaymentUrl === '') {
    return null;
  }

  return (
    <Modal visible={show} onRequestClose={onWebviewClose}>
      <SafeAreaView style={safeStyle}>
        <RenderIf condition={IS_IOS}>
          <NavBar
            title={t('cart_payment.title.payment')}
            useWhite
            useBack
            useBackPress={onWebviewClose}
          />
        </RenderIf>
        <View style={[styles.displayFlex]}>
          <WebView
            ref={webviewRef}
            onLoad={onWebviewLoad}
            onNavigationStateChange={onWebviewNavigationStateChange}
            source={{uri: snapPaymentUrl}}
            style={webviewStyle}
            onError={onWebviewError}
            originWhitelist={['http://*', 'https://*', 'intent://*']}
          />
          <RenderIf condition={showWebviewLoader}>
            <CustomView style={styles.loadingCenter}>
              <ActivityIndicator
                size="large"
                color={Colors.PRIMARY}
                style={styles.activityIndicator}
              />
            </CustomView>
          </RenderIf>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ModalPaymentSnap;
