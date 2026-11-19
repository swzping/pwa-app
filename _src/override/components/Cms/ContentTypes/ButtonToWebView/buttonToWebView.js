import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

const ButtonToWebView = data => {
  const {text} = data;
  const handlePress = () => {
    navigateTo(
      modules.guardian_run_register.enable,
      modules.guardian_run_register.name,
    );
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={handlePress}>
        <View style={styles.viewStyle}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({

  wrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '-3%',
  },
  viewStyle: {
    width: 95,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'white',
  },
  button: {
    marginTop: '-19%',
    borderRadius: 50,
  },
  text: {
    borderRadius: 5,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF8200',
    backgroundColor: 'white',
  },
});

export default ButtonToWebView;
