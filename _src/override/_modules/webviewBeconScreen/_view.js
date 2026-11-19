import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';

import styles from '@app/_modules/webviewBeconScreen/style.js';
import NavBar from '@app/components/NavBar';

import CustomDialog from './WellnessProfileModal';

/**
 * Becon WebView 容器页面
 * @param {string} webViewUrl - 加载地址
 * @param {boolean} isNavBar - 是否展示导航栏
 * @param {string} title - 导航栏标题
 */
const Views = ({
  webViewRef,
  title = '',
  isNavBar,
  showDialog,
  source = '',
  isLoading,
  loadProgress,
  setShowDialog,
  showLoginDialog,
  injectedJavaScript,
  handleWebMessage,
  handleWebError,
  handleLoadStart,
  handleLoadEnd,
  handleHttpError,
  handleLoadProgress,
  handleRenderProcessGone,
  handleShouldStartLoadWithRequest,
}) => {
  if (!source) {
    return (
      <View style={styles.container}>
        {isNavBar && <NavBar useBack={true} useWhite={true} title={title} />}
        <View style={styles.webview} />
      </View>
    );
  }

  const renderLoading = () => {
    return isLoading ? (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#ff8200" />
        <Text style={styles.loadingText}>
          {`Loading ${Math.round(loadProgress * 100)}%`}
        </Text>
      </View>
    ) : null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isNavBar && <NavBar useBack={true} useWhite={true} title={title} />}
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={source}
        originWhitelist={['*']}
        onMessage={handleWebMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        cacheEnabled={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        onLoadStart={handleLoadStart}
        onError={handleWebError}
        onLoadEnd={handleLoadEnd}
        onHttpError={handleHttpError}
        onLoadProgress={handleLoadProgress}
        onRenderProcessGone={handleRenderProcessGone}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />

      <CustomDialog
        visible={showDialog.visible}
        title={showDialog.title}
        subtitle={showDialog.subTitle}
        onClose={() => setShowDialog(prev => ({...prev, visible: false}))}
      />

      {renderLoading()}
    </SafeAreaView>
  );
};

export default Views;
