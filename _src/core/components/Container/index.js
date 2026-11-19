import {Mixins, Colors} from '@app/styles';
import React from 'react';
import CustomView from '@app/components/CustomView';

const Container = ({
  backgroundColor: backgroundColorProp,
  centerChildren,
  children,
  flex: flexProp,
  height: heightProp,
  style,
  width: widthProp,
}) => {
  let backgroundColor = Colors.WHITE;
  if (backgroundColorProp) {
    backgroundColor = backgroundColorProp;
  }

  let alignItems = 'flex-start';
  let justifyContent = 'flex-start';
  if (centerChildren) {
    alignItems = 'center';
    justifyContent = 'center';
  }

  let flex = 0;
  if (flexProp) {
    typeof flexProp === 'boolean' ? (flex = 1) : (flex = flexProp);
  }

  let height = 'auto';
  if (heightProp) {
    height = heightProp;
  }

  let width = Mixins.MAX_WIDTH;
  if (widthProp) {
    width = widthProp;
  }

  return (
    <CustomView
      style={[
        {
          alignItems,
          backgroundColor,
          flex,
          justifyContent,
          height,
          width,
        },
        style,
      ]}>
      {children}
    </CustomView>
  );
};

export default Container;
