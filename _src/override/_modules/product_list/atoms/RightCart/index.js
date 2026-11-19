import React from 'react';
import {Image, Text, View} from 'react-native';

import {useReactiveVar} from '@apollo/client';

// import IconFeather from 'react-native-vector-icons/Feather';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {rxCartQty} from '@app/services/cache';
import {Colors} from '@app/styles';

const AtomRightCart = ({onPressCart}) => {
  const getRxCartQty = useReactiveVar(rxCartQty);

  return (
    <CustomView
      width={28}
      padding={10}
      paddingLeft={16}
      paddingRight={12}
      horizontalCenter
      verticalCenter
      onPress={onPressCart}>
      {/*<IconFeather name="shopping-cart" color={Colors.PRIMARY} size={22} />*/}
      <Image
        source={require('../../../../assets/images/cart_top.png')}
        style={{width: 28, height: 28}}
      />
      <RenderIf condition={getRxCartQty}>
        {/*<Circle*/}
        {/*  color={Colors.RED_LIGHT_2}*/}
        {/*  number={getRxCartQty ?? 0}*/}
        {/*  textColor={Colors.WHITE}*/}
        {/*  textSize={8}*/}
        {/*  size={16}*/}
        {/*  topPosition={-5}*/}
        {/*  rightPosition={-5}*/}
        {/*/>*/}

        <View
          style={{
            backgroundColor: Colors.RED_LIGHT_2,
            borderRadius: 20,
            width: 20,
            height: 14,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FFFFFF',
            top: 4,
            right: -3,
            position: 'absolute',
            alignSelf: 'center',
          }}>
          <Text style={{color: '#FFFFFF', fontSize: 8, fontWeight: 'bold'}}>
            {getRxCartQty > 99 ? '99+' : getRxCartQty}
          </Text>
        </View>
      </RenderIf>
    </CustomView>
  );
};

export default AtomRightCart;
