import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import RNFImage from '@app/components/Image';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';

const TreeNLayout = ({items}) => {
  const [rightItemHeight, setRightItemHeight] = useState(0);

  const handleLeftLayout = event => {
    const {height} = event.nativeEvent.layout;
    setRightItemHeight((height - 8) / 2);
  };

  const handlePress = link => {
    if (link) {
      resolveLinkAndNavigate(link);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer} onLayout={handleLeftLayout}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePress(items[0]?.link)}
          disabled={!items[0].link}
          style={styles.fullSize}>
          <RNFImage
            source={items[0]?.mobileImage || items[0]?.desktopImage}
            style={styles.fullSize}
            resizeMode="stretch"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.rightContainer}>
        {[1, 2].map(index => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => handlePress(items[index]?.link)}
            disabled={!items[index].link}
            style={[styles.rightItem, {height: rightItemHeight}]}>
            <RNFImage
              source={items[index]?.mobileImage || items[index]?.desktopImage}
              style={styles.fullSize}
              resizeMode="stretch"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // gap: 8,
    aspectRatio: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rightContainer: {
    flex: 1,
    // gap: 8,
  },
  rightItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  fullSize: {
    width: '100%',
    height: '100%',
  },
});

export default TreeNLayout;
