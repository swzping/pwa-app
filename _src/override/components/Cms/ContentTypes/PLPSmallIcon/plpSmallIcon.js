import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';
import resourceUrl from '@app/helpers/MakeUrl';
import PLPHorizontalScroll from '../PLPHorizontalScroll';

/**
 * PLP专用SmallIcon组件：
 * - 最多显示4个
 * - 超出可左右拖动
 * - 有分页点
 * - 不需要自动滚动
 */
const PLPSmallIcon = ({position, items}) => {
  const renderItem = (item, index) => (
    <TouchableOpacity
      style={styles.iconContent}
      onPress={() => resolveLinkAndNavigate(item.link)}
      activeOpacity={0.7}>
      <FastImage
        source={{
          uri: resourceUrl(item.image, {
            type: 'image-wysiwyg',
            quality: 85,
          }),
          priority: FastImage.priority.normal,
        }}
        style={styles.iconImage}
        resizeMode="contain"
      />
      {item.caption && (
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.iconCaption}>
          {item.caption}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <PLPHorizontalScroll
      items={items}
      renderItem={renderItem}
      containerStyle={styles.container}
      paginationStyle={styles.paginationContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingLeft: -12,
  },
  iconContent: {
    alignItems: 'center',
  },
  iconImage: {
    width: 70,
    height: 70,
    marginBottom: 6,
  },
  iconCaption: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    minHeight: 35,
  },
  paginationContainer: {
    paddingTop: 12,
    paddingBottom: 4,
  },
});

export default PLPSmallIcon;

