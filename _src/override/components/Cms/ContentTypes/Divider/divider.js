import React from 'react';
import {StyleSheet, View} from 'react-native';

const DividerWidget = ({customStyles}) => {
  return (
    <View style={[styles.container, customStyles?.container]}>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#FFF',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    borderRadius: 1,
  },
});

export default DividerWidget;
