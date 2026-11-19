import React from 'react';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {MixinsNew} from '@app/styles/index';

const WidgetTermsConditions = ({children}) => {
  return (
    <CustomView
      horizontalCenter
      width={MixinsNew.MAX_WIDTH}
      paddingHorizontal={20}>
      {children.map((child, index) => {
        if (child.name === 'h1') {
          return (
            <Text key={index} xlarge bold style={{paddingVertical: 10}}>
              {child.children[0].data}
            </Text>
          );
        } else if (child.name === 'p') {
          return (
            <Text key={index} justify>
              {child.children[0].data}
            </Text>
          );
        }
      })}
    </CustomView>
  );
};

export default WidgetTermsConditions;
