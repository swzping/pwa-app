import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import React from 'react';
import {Modal} from 'react-native';
import Button from '@app/components/Button';
import styles from '@app/components/Dialog/styles';

const Dialog = ({
  visible,
  secondButtonLabel,
  onPressSecondButton,
  buttonLabel,
  onPressButton,
  message = '',
}) => {
  return (
    <Modal visible={visible} transparent>
      <CustomView
        flex
        horizontalCenter
        verticalCenter
        backgroundColor={'rgba(0,0,0, .8)'}>
        <CustomView
          width={'90%'}
          padding={20}
          borderRadius={15}
          horizontalCenter
          verticalCenter>
          <Text center large style={[styles.frameTitle]}>
            {message}
          </Text>
          <CustomView row>
            {onPressSecondButton && (
              <CustomView width={'50%'} hpadding={5}>
                <Button
                  label={secondButtonLabel.toUpperCase()}
                  onPress={onPressSecondButton}
                  styleProp={{width: '100%'}}
                />
              </CustomView>
            )}
            <CustomView
              width={onPressSecondButton ? '50%' : '100%'}
              paddingHorizontal={5}>
              <Button
                label={buttonLabel.toUpperCase()}
                onPress={onPressButton}
                styleProp={{width: '100%'}}
              />
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

export default Dialog;
