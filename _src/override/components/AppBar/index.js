import React from 'react';
import { Appbar, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@app/styles/index';

import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text';
import RenderIf from '@app/components/RenderIf/index';
import useCarts from '@app/hooks/carts/useCarts';

const AppBarComponent = ({
  useBack,
  useCart,
  onPressCart,
  title,
  subtitle,
  center,
}) => {
  const navigation = useNavigation();
  const { data: cartData } = useCarts({
    initialized: true,
  });
  return (
    <Appbar.Header
      style={{ elevation: 0, backgroundColor: Colors.WHITE }}
    >
      {useBack && (
        <Appbar.BackAction
          color={Colors.BLACK}
          onPress={() => navigation.goBack()}
        />
      )}
      <Appbar.Content
        title={title}
        subtitle={subtitle}
        style={center && { alignItems: 'center' }}
      />

      {useCart && (
        <CustomView style={{ position: 'relative' }}>
          <Appbar.Action
            icon="cart"
            color={Colors.PRIMARY}
            onPress={onPressCart}
          />
          <RenderIf condition={cartData?.length}>
            <Badge size={16} style={{ position: 'absolute', top: 8, right: 8 }}>
              <Text bold xsmall white>
                {cartData?.length ?? 0}
              </Text>
            </Badge>
          </RenderIf>
        </CustomView>
      )}
    </Appbar.Header>
  );
};

export default AppBarComponent;
