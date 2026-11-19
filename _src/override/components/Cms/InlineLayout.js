import React from 'react';
import {View, StyleSheet} from 'react-native';

const InlineLayout = ({children}) => {
  const processedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      const key = child.key || `child-${index}`;
      if (child.props?.contentType === 'image') {
        return React.cloneElement(child, {
          key,
          customStyles: {
            container: {
              ...styles.childContainer,
            },
          },
        });
      }
      return React.cloneElement(child, {
        key,
        style: {
          ...styles.childContainer,
        },
      });
    }
    return child;
  });

  return <View style={styles.twoColContainer}>{processedChildren}</View>;
};

const styles = StyleSheet.create({
  twoColContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    // gap: 8,
  },
  childContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

export default InlineLayout;
