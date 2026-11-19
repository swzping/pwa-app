import React from 'react';
import {TouchableOpacity} from 'react-native';

import Collapsible from 'react-native-collapsible';
import Icon from 'react-native-vector-icons/Ionicons';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

/**
 * ---------------------------------------------------- *
 * One filter group: header (label + chevron) with a
 * Collapsible body — children stay mounted while collapsed
 * so the draft selection visuals survive. Passing `trailing`
 * (e.g. a boolean checkmark) replaces the chevron and drops
 * the body entirely: the group becomes a single non-expanding
 * row and `onToggleCollapsed` becomes that row's press action.
 * ---------------------------------------------------- *
 */
const Section = ({
  aggregation,
  collapsed,
  onToggleCollapsed,
  isLast,
  trailing,
  children,
}) => {
  return (
    <CustomView
      style={{
        backgroundColor: Colors.WHITE,
        marginBottom: isLast ? 32 : 12,
      }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggleCollapsed}
        style={{
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: Colors.GRAY_LIGHT,
        }}>
        <CustomView row spaceBetween verticalCenter paddingHorizontal={20}>
          <Text medium>{aggregation.label}</Text>
          {trailing ?? (
            <Icon
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              size={24}
              color={'#212121'}
            />
          )}
        </CustomView>
      </TouchableOpacity>
      {trailing ? null : (
        <Collapsible style={{paddingHorizontal: 16, paddingVertical: 16}} collapsed={collapsed}>
          {children}
        </Collapsible>
      )}
    </CustomView>
  );
};

export default Section;
