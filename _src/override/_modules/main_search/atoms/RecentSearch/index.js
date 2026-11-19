import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const RecentSearch = ({data = [], onPressItem, onClear}) => {
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
        <Text bold style={styles.title}>
          Recent search
        </Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>X Clear</Text>
        </TouchableOpacity>
      </CustomView>
      <CustomView style={styles.chipsContainer}>
        {displayData.map((item, index) => (
          <TouchableOpacity
            key={`recent-${index}`}
            style={styles.chip}
            onPress={() => onPressItem(item)}>
            <Text style={styles.chipText}>{item}</Text>
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

export default RecentSearch;

