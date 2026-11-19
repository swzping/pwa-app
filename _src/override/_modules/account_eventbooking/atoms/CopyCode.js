import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Button} from 'react-native-paper';

import Clipboard from '@react-native-clipboard/clipboard';

import CustomView from '@app/components/CustomView';
import * as Colors from '@app/styles/colors';
const CopyCode = ({bgStyle = {}, code, onPress}) => {
  const [showCopyTip, setShowCopyTip] = useState(false);

  const onCopy = () => {
    Clipboard.setString(code);
    setShowCopyTip(true);
    setTimeout(() => {
      setShowCopyTip(false);
    }, 2000);
    onPress && onPress();
  };

  return (
    <CustomView
      row
      horizontalCenter
      style={{gap: 12, borderRadius: 8, ...bgStyle}}>
      <CustomView
        flex={1}
        verticalCenter
        paddingHorizontal={12}
        border={1}
        borderColor="#E0E0E0"
        borderRadius={6}
        backgroundColor="#fff"
        style={{minHeight: 40}}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'SF Pro',
            fontWeight: '700',
            lineHeight: 22,
            color: '#212121',
          }}>
          {code}
        </Text>
      </CustomView>
      <Button
        style={{
          minWidth: 76,
          minHeight: 40,
          backgroundColor: Colors.PRIMARY,
          borderRadius: 6,
        }}
        labelStyle={{
          color: Colors.WHITE,
          fontSize: 14,
          fontWeight: '700',
          textTransform: 'none',
        }}
        onPress={onCopy}>
        Copy
      </Button>
      {showCopyTip && (
        <View style={styles.copyTip}>
          <View style={styles.copyTipArrow} />
          <Text style={styles.copyTipText}>Code copied</Text>
        </View>
      )}
    </CustomView>
  );
};

export default CopyCode;

const styles = StyleSheet.create({
  copyTip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginTop: 12,
    transform: [{translateX: -30}],
    backgroundColor: '#666666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1000,
    elevation: 10,
  },
  copyTipArrow: {
    position: 'absolute',
    top: -6,
    left: '50%',
    transform: [{translateX: -3}],
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#666666',
  },
  copyTipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
