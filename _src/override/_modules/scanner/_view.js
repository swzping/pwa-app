

import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Alert, Linking, Animated  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import styles from '@app/_modules/scanner/styles';
import Icon from 'react-native-vector-icons/Feather';
import { Snackbar } from 'react-native-paper';
import Lottie from 'lottie-react-native';
import useAppStateChanged from '@app/hooks/useAppStateChanged';

const ScannerView = props => {
  const {
    handleBarCodeRead,
    message,
    showTip,
    setShowTip,
    cameraRef,
    loading,
    isFocused,
    isCameraPaused,
  } = props;
  const navigation = useNavigation();

  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [isAppActive, setIsAppActive] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // 淡入动画

  useEffect(() => {
    const timer = setTimeout(() => {
      requestCameraPermission();
    }, 260);
    return () => clearTimeout(timer);
  }, []);

  // 监听相机 ready，触发淡入
  useEffect(() => {
    if (isCameraReady) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCameraReady]);

  useAppStateChanged({
    whenAppInForeground: async() => {
      console.log('App is in foreground');
      const permission = await Camera.getCameraPermissionStatus();
      if (permission === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
      setIsAppActive(true);
    },
    whenAppInBackGround: () => {
      console.log('App is in background');
      setIsAppActive(false);
    },
  });

  // 兼容 RNCamera 的 pausePreview 调用
  useEffect(() => {
    if (cameraRef) {
      cameraRef.current = {
        pausePreview: () => { }, // 空函数，实际通过 isCameraPaused 控制 isActive
        resumePreview: () => { },
      };
    }
  }, [cameraRef]);

  const openCameraSettings = () => {
    Alert.alert(
      'Permission to use camera',
      'Please allow camera access in Settings',
      [
        {
          text: 'Cancel',
          style: 'Cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };
  const requestCameraPermission = async () => {
    try {
      const status = await Camera.requestCameraPermission();
      const granted = status === 'granted';
      setHasPermission(granted);
      // 用户拒绝
      if (!granted) {
        openCameraSettings();
      }
    } catch (error) {
      console.log('requestCameraPermission error:', error);
      setHasPermission(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'ean-8', 'upc-a', 'code-39'],
    onCodeScanned: (codes) => {
      if (loading || isCameraPaused) { return; }
      if (codes.length > 0) {
        const code = codes[0];
        // 转换 type 为大写以匹配 Controller 中的 "QR" 判断逻辑
        const type = code.type ? code.type.toUpperCase() : 'UNKNOWN';
        handleBarCodeRead({ data: code.value, type });
      }
    },
  });

  const getTipText = () => {
    if (loading) {
      return 'Loading...';
    } else {
      return 'Aim at barcode/QRCode';
    }
  };

  const showCamera = isFocused && device && hasPermission;
  // 当暂停时，isActive=false 可能会导致黑屏(视具体版本而定)，但这通常是可以接受的
  const isActive = isFocused && !isCameraPaused && isAppActive;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.preview, {opacity: fadeAnim}]}>
        {showCamera ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            codeScanner={codeScanner}
            enableZoomGesture={true}
            onInitialized={() => {
              requestAnimationFrame(() => {
                setIsCameraReady(true);
              });
            }}
          />
        ) : null}
        {/* 提示文字 */}
        {isCameraReady && !showCamera  ? (
          <View style={[styles.preview]}>
            {!hasPermission && isFocused && (
              <Text color="white">No Camera Permission</Text>
            )}
            {!device && isFocused && (
              <Text color="white">No Camera Device</Text>
            )}
          </View>
        ) : null}
      </Animated.View>

      {/* UI Overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <SafeAreaView edges={['top']} />
        <CustomView style={styles.backBtnWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name={'chevron-left'} size={30} color={'white'} />
          </TouchableOpacity>
        </CustomView>
        <CustomView
          style={styles.scanBox}
          flex
          horizontalCenter
          verticalCenter
          pointerEvents="none">
          <Lottie
            source={require('@app/assets/animations/scanner.json')}
            autoPlay
            loop
            style={styles.scanBoxImg}
          />
          <CustomView style={styles.scanTip}>
            <Text color="white">{getTipText()}</Text>
          </CustomView>
        </CustomView>
      </View>

      <Snackbar
        style={{ marginBottom: 60, backgroundColor: 'black', zIndex: 10 }}
        visible={showTip}
        onDismiss={() => setShowTip(false)}
        duration={2000}>
        <CustomView flex row padding={0} horizontalCenter>
          <Icon
            name={'info'}
            size={30}
            color={'orange'}
            style={{ marginRight: 10 }}
          />
          <Text color="white">{message}</Text>
        </CustomView>
      </Snackbar>
    </View>
  );
};
export default ScannerView;
