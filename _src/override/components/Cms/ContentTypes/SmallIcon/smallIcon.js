import React, {useContext, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import FastImage from '@d11/react-native-fast-image';

import {useParentData} from '@app/components/Cms/hooks/useParentData';
import Swiper from '@app/components/Swiper';
import {NavigatorContext} from '@app/helpers/Context';
import resourceUrl from '@app/helpers/MakeUrl';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';
import {trackHomepageModuleClick} from '@app/track';

const getRows = items => {
  const filtered = items.filter(item => !item.hide);
  const count = filtered.length;

  if (count <= 5) {
    return [filtered];
  }
  switch (count) {
    case 6:
      return [filtered.slice(0, 3), filtered.slice(3, 6)];
    case 7:
      return [filtered.slice(0, 4), filtered.slice(4, 7)];
    case 8:
      return [filtered.slice(0, 4), filtered.slice(4, 8)];
    case 9:
      return [filtered.slice(0, 5), filtered.slice(5, 9)];
    case 10:
      return [filtered.slice(0, 5), filtered.slice(5, 10)];
    default:
      return [filtered];
  }
};

const IconItem = ({item, style, index, position, contentType}) => {
  const parentDataFromContext = useParentData();
  const {routeName} = useContext(NavigatorContext);

  return (
    <TouchableOpacity
      style={[styles.iconWrapper, style]}
      onPress={() => {
        resolveLinkAndNavigate(item.link);
        trackHomepageModuleClick({
          routeName,
          module_rank: position + '-' + index,
          module_content: parentDataFromContext.rawData.cssClasses,
          location_name: item.caption,
          resource_type: contentType,
        });
      }}
      activeOpacity={0.7}>
      <FastImage
        source={{
          uri: resourceUrl(item.image, {
            type: 'image-wysiwyg',
            quality: 85,
          }),
          priority: FastImage.priority.normal,
        }}
        style={[styles.iconImage]}
        resizeMode="contain"
      />
      {item.caption && (
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.iconCaption}>
          {item.caption}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const SmallIconWidget = ({position, items, contentType}) => {
  const {width} = useWindowDimensions();

  // 如果是图标数量超过10个，则展示 Carousel
  const shouldShowCarousel = useMemo(() => {
    return items.length > 10;
  }, [items]);

  const renderIcon = (item, index) => (
    <View style={styles.iconsContainer} key={index}>
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => {
          resolveLinkAndNavigate(item.link);
        }}>
        <FastImage
          source={{
            uri: resourceUrl(item.image, {
              type: 'image-wysiwyg',
              quality: 85,
            }),
            priority: FastImage.priority.normal,
          }}
          style={[styles.iconImage]}
          resizeMode="contain"
        />
        {item.caption && (
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.iconCaption}>
            {item.caption}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // 非Carousel场景的布局逻辑
  const nonCarouselLayout = useMemo(() => {
    const rows = getRows(items);

    return (
      <View style={styles.nonCarouselContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.rowContainer}>
            {row.map((item, index) => (
              <IconItem
                key={index}
                item={item}
                index={index}
                position={position}
                contentType={contentType}
                style={{flex: 1, maxWidth: 90}}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }, [items]);

  const carouselLayout = useMemo(() => {
    return (
      <Swiper
        rows={2}
        dots={true}
        slidesPerView={5}
        slidesPerGroup={5}
        spaceBetween={5}
        initialWidth={width - 32}>
        {items.map((item, index) => renderIcon(item, index))}
      </Swiper>
    );
  }, [items]);

  return (
    <View style={styles.container}>
      {shouldShowCarousel ? carouselLayout : nonCarouselLayout}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nonCarouselContainer: {
    flexDirection: 'column',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  iconsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
  },
  iconImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  iconCaption: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    minHeight: 35,
  },
});

export default SmallIconWidget;
