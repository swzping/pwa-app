import React, {useMemo, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
// 4个项目，左右各12px padding，项目之间固定间距2px
const CONTAINER_WIDTH = SCREEN_WIDTH - 24; // 减去左右padding
const GAP = 2; // 项目之间的固定间距
const ITEM_WIDTH = (CONTAINER_WIDTH - GAP * 3) / 4; // 减去3个间距，除以4
const MAX_VISIBLE_ITEMS = 4;
const PAGE_WIDTH = SCREEN_WIDTH; // 每页的宽度，用于snapToInterval

/**
 * PLP通用横向滚动组件：
 * - 最多显示4个
 * - 超出可左右拖动
 * - 有分页点
 * - 不需要自动滚动
 */
const PLPHorizontalScroll = ({
  items,
  renderItem,
  containerStyle,
  rowStyle,
  itemStyle,
  paginationStyle,
}) => {
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 如果少于等于4个，直接显示，不需要滚动
  const shouldScroll = items.length > MAX_VISIBLE_ITEMS;
  const totalPages = Math.ceil(items.length / MAX_VISIBLE_ITEMS);

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    // 每个页面的宽度是PAGE_WIDTH（因为pageContainer的width是SCREEN_WIDTH）
    const currentIndex = Math.round(contentOffsetX / PAGE_WIDTH);
    setActiveIndex(Math.min(currentIndex, totalPages - 1));
  };

  // 将items分组，每组最多4个
  const groupedItems = useMemo(() => {
    const groups = [];
    for (let i = 0; i < items.length; i += MAX_VISIBLE_ITEMS) {
      groups.push(items.slice(i, i + MAX_VISIBLE_ITEMS));
    }
    return groups;
  }, [items]);

  if (!shouldScroll) {
    // 少于等于4个，直接显示
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.itemsRow, rowStyle]}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <View
                key={index}
                style={[
                  styles.itemWrapper,
                  itemStyle,
                  isLast && styles.itemWrapperLast,
                ]}>
                {renderItem(item, index, isLast)}
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // 超过4个，使用ScrollView滚动
  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={PAGE_WIDTH}
        decelerationRate="fast">
        {groupedItems.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.pageContainer}>
            <View style={[styles.itemsRow, rowStyle]}>
              {group.map((item, index) => {
                const isLast = index === group.length - 1;
                return (
                  <View
                    key={index}
                    style={[
                      styles.itemWrapper,
                      itemStyle,
                      isLast && styles.itemWrapperLast,
                    ]}>
                    {renderItem(item, groupIndex * MAX_VISIBLE_ITEMS + index, isLast)}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      {/* 分页点 */}
      {totalPages > 1 && (
        <View style={[styles.paginationContainer, paginationStyle]}>
          {Array.from({length: totalPages}).map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pageContainer: {
    width: PAGE_WIDTH,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: CONTAINER_WIDTH,
    flexWrap: 'nowrap',
  },
  itemWrapper: {
    width: ITEM_WIDTH,
    marginRight: GAP,
  },
  itemWrapperLast: {
    marginRight: 0,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FF6B00',
    width: 20,
  },
});

export default PLPHorizontalScroll;
export {ITEM_WIDTH, GAP, CONTAINER_WIDTH};

