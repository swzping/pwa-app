import React, {useState} from 'react';
import {View, TouchableOpacity, ScrollView} from 'react-native';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, {Path} from 'react-native-svg';
import styles from './styles';

const HotKeywords = ({data = [], onPressItem, onShowMore}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || data.length === 0) {
    return null;
  }

  // 默认显示10个，展开后显示15个
  const displayLimit = isExpanded ? 15 : 10;
  const displayData = data.slice(0, displayLimit);
  const hasMore = data.length > 10;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <CustomView style={styles.container}>
      <CustomView style={styles.header}>
        <CustomView style={styles.titleRow}>
          <Text bold style={styles.title}>
            Hot Keywords
          </Text>
          <Svg width="12" height="17" viewBox="0 0 12 17" fill="none" style={styles.icon}>
            <Path d="M6.75 1C6.75 4.21875 12 4.9375 12 10.25C12 13.5625 9.28125 16.25 6 16.25C2.6875 16.25 0 13.5625 0 10.25C0 8.4375 0.84375 6.9375 1.6875 6.0625C2.15625 5.5625 3 5.875 3 6.5625V9.25C3 10.3438 3.84375 11.25 4.96875 11.25C6.0625 11.2812 7 10.375 7 9.25C7 6.5 1.5 6.25 5.34375 0.59375C5.78125 0 6.75 0.28125 6.75 1Z" fill="#FF0000"/>
          </Svg>
        </CustomView>
      </CustomView>
      <CustomView style={styles.chipsContainer}>
        {displayData.map((item, index) => (
          <TouchableOpacity
            key={`hot-${item?.uclid || item?.query_text || item?.label || index}`}
            style={[styles.chip, item?.isFromAd && styles.adChip]}
            onPress={() => onPressItem(item)}>
            <Text style={styles.chipText}>
              {typeof item === 'string' ? item : item?.query_text || item?.label}
            </Text>
          </TouchableOpacity>
        ))}
        {hasMore && (
          <TouchableOpacity style={styles.moreChip} onPress={handleToggleExpand}>
            <Icon 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={Colors.BLACK} 
            />
          </TouchableOpacity>
        )}
      </CustomView>
    </CustomView>
  );
};

export default HotKeywords;

