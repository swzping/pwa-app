import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ParentDataProvider} from '@app/components/Cms/hooks/useParentData';

const RowWidget = ({widget, minHeight, backgroundColor, style, children, cssClasses}) => {
  const dynamicStyles = {
    minHeight,
  };

  return (
    <ParentDataProvider data={{cssClasses: cssClasses || []}}>
      <View
        style={[
          styles.container,
          dynamicStyles,
          backgroundColor ? styles.hasBackground : {},
          {backgroundColor},
          style,
        ]}>
        {children}
      </View>
    </ParentDataProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  hasBackground: {
    marginVertical: 8,
  },
});

export default RowWidget;
