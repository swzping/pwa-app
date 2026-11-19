import React from 'react';
import { Colors, Mixins } from '@app/styles';
import { normalize } from '@app/styles/mixins';
import { useReactiveVar } from '@apollo/client';
import { Button, Text, MD2Colors as ColorsPaper } from 'react-native-paper';
import { KeyboardAvoidingView, Modal, StyleSheet, TextInput } from 'react-native';
import CustomView from '@app/components/CustomView';
import Icon from 'react-native-vector-icons/AntDesign';
import { rxUserTheme } from '@app/services/cache';
import i18next from 'i18next';

const QuantityModal = ({
  visible = true,
  name,
  quantity = 0,
  onChangeQuantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onSubmit,
  submitLabel = i18next.t('cart.quantity_modal.label.submit'),
  loading,
  onBackBackButtonPress,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const color = scheme === 'dark' ? Colors.WHITE : Colors.BLACK;

  return (
    <Modal visible={visible} transparent onRequestClose={onBackBackButtonPress}>
      <CustomView backgroundColor="rgba(0, 0, 0, 0.6)">
        <CustomView height={Mixins.MAX_HEIGHT * 0.65} />
        <KeyboardAvoidingView behavior="position">
          <CustomView
            horizontalCenter
            verticalCenter
            height={Mixins.MAX_HEIGHT * 0.35}
            width={Mixins.MAX_WIDTH}>
            <CustomView
              marginHorizontal={30}
              style={styles.closeBtnContainer}
              onPress={onBackBackButtonPress}>
              <Icon name="close" size={normalize(20)} />
            </CustomView>
            <Text large style={{ marginBottom: normalize(5) }}>
              {name}
            </Text>
            <Text style={{ marginBottom: normalize(5) }}>
              {i18next.t('cart.quantity_modal.view.quantity')}
            </Text>

            <CustomView
              row
              horizontalCenter
              verticalCenter
              spaceBetween
              width={100}
              marginVertical={20}>
              <CustomView onPress={onDecreaseQuantity}>
                <Icon name="minuscircleo" size={normalize(20)} color={color} />
              </CustomView>

              <TextInput
                value={quantity.toString()}
                onChangeText={onChangeQuantity}
                keyboardType="number-pad"
                style={[
                  styles.quantityInput,
                  {
                    color: color,
                    borderColor: color,
                  },
                ]}
              />

              <CustomView onPress={onIncreaseQuantity}>
                <Icon name="pluscircleo" size={normalize(20)} color={color} />
              </CustomView>
            </CustomView>

            <Button
              loading={loading}
              mode="contained"
              onPress={() => onSubmit()}>
              <Text style={{ color: ColorsPaper.white }}>{submitLabel}</Text>
            </Button>
          </CustomView>
        </KeyboardAvoidingView>
      </CustomView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeBtnContainer: {
    alignSelf: 'flex-end',
  },
  quantityInput: {
    borderBottomWidth: 1,
    textAlign: 'center',
    fontSize: normalize(16),
  },
});

export default QuantityModal;
