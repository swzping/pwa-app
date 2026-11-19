import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import RenderHTML from 'react-native-render-html';

const TextWidget = ({content, noPaddingTopAndBottom = false}) => {
  const {width} = Dimensions.get('window');

  if (!content) {
    return null;
  }
  return (
    <View
      style={[
        styles.container,
        noPaddingTopAndBottom && styles.noPaddingTopAndBottomStyle,
      ]}>
      <RenderHTML
        contentWidth={width}
        source={{html: content}}
        tagsStyles={{
          p: {
            margin: 0,
            padding: 0,
          },
          br: {
            margin: 0,
          },
          span: {
            margin: 0,
            padding: 0,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  noPaddingTopAndBottomStyle: {
    paddingVertical: 0,
  },
});

export default TextWidget;
