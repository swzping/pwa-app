import React from 'react';

import {useReactiveVar} from '@apollo/client';

import CartIcon from '@app/assets/svgs/CartV2';
import Circle from '@app/components/Circle';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {rxCartQty} from '@app/services/cache';
import {Colors} from '@app/styles';

const AtomRightCart = ({onPressCart}) => {
  const getRxCartQty = useReactiveVar(rxCartQty);
  const iconSize = 28;

  return (
    <CustomView
      width={iconSize}
      padding={10}
      paddingLeft={16}
      paddingRight={12}
      horizontalCenter
      verticalCenter
      onPress={onPressCart}>
      {/*<IconFeather name="shopping-cart" color={Colors.PRIMARY} size={22} />*/}
      <CartIcon color={Colors.PRIMARY} width={iconSize} height={iconSize} />
      <RenderIf condition={getRxCartQty}>
        <Circle
          color={Colors.RED}
          number={getRxCartQty ?? 0}
          textColor={Colors.WHITE}
          textSize={8}
          size={16}
          topPosition={4}
          rightPosition={-3}
        />
      </RenderIf>
    </CustomView>
  );
};

export default AtomRightCart;
