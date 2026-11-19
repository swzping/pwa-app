import React, {
  useState,
  useMemo,
  useCallback,
  Children,
  useEffect,
} from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Colors} from '@app/styles';
import {Styles} from '@app/styles';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';
import ArrowRight from '@app/assets/svgs/ArrowRight';

const TabsWidget = props => {
  const {defaultIndex = 0, headers = [], children, view_all_url, view_all_title = 'Show All', isPLP = false} = props;
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const opacity = useSharedValue(0);

  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [selectedIndex]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleTabPress = useCallback(index => {
    setSelectedIndex(index);
  }, []);

  const renderTabItem = ({item, index}) => {
    const isActive = selectedIndex === index;
    const isFirst = index === 0;
    let activeStyle = null;
    if (isActive) {
      if (isFirst) {
        activeStyle = styles.activeFirstTabItem;
      } else {
        activeStyle = styles.activeTabItem;
      }
    }

    return (
      <TouchableOpacity
        style={[styles.tabItem, isFirst && styles.firstTabItem, activeStyle]}
        onPress={() => handleTabPress(index)}>
        <Text
          style={[
            Styles.boldText,
            styles.tabText,
            isActive && styles.activeText,
          ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabHeaderContainer}>
        <FlatList
          horizontal
          data={headers}
          renderItem={renderTabItem}
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabList}
          style={styles.tabListWrapper}
        />
        {/* Show All 链接 - 只在 PLP 页面且有 view_all_url 时显示 */}
        {isPLP && view_all_url && (
          <TouchableOpacity
            onPress={() => resolveLinkAndNavigate(view_all_url)}
            style={styles.showAllButton}>
            <Text style={styles.showAllText}>{view_all_title}</Text>
            <ArrowRight color={Colors.PRIMARY} />
          </TouchableOpacity>
        )}
      </View>

      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {childrenArray[selectedIndex]}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  tabListWrapper: {
    flex: 1,
  },
  tabList: {
    paddingLeft: 12,
    backgroundColor: '#FFF',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  showAllText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  showAllArrow: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginLeft: 4,
  },
  tabItem: {
    padding: 16,
    overflow: 'hidden',
  },
  firstTabItem: {
    marginLeft: -12,
    paddingLeft: 28,
  },
  activeTabItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: Colors.TAB_ACTIVE,
  },
  activeFirstTabItem: {
    borderTopRightRadius: 12,
    backgroundColor: Colors.TAB_ACTIVE,
  },
  activeContainer: {
    borderColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#545453',
  },
  activeText: {
    color: Colors.PRIMARY,
  },
  unActiveText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  content: {
    flex: 1,
    paddingVertical: 4,
  },
});

export default TabsWidget;
