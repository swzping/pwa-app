import React from 'react';
import {View, StyleSheet} from 'react-native';
import InlineLayout from '../../InlineLayout';
import {ParentDataProvider} from '@app/components/Cms/hooks/useParentData';

const ColumnWidget = ({
  marginHorizontal,
  backgroundColor,
  marginTop,
  marginBottom,
  borderRadius,
  style,
  cssClasses,
  children,
}) => {
  const dynamicStyles = {
    marginHorizontal,
    backgroundColor,
    marginTop,
    marginBottom,
    borderRadius,
    overflow: 'hidden',
  };

  if (cssClasses.includes('app-banner-image-two-col')) {
    return <InlineLayout>{children}</InlineLayout>;
  }

  return (
    <ParentDataProvider data={{cssClasses: cssClasses || []}}>
      <View style={[styles.container, dynamicStyles, style]}>{children}</View>
    </ParentDataProvider>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default ColumnWidget;
