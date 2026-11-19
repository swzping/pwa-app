import React from 'react';
import {Modal} from 'react-native';

import Button from '@app/components/Button/index';
import CustomView from '@app/components/CustomView';
import styles from '@app/components/Dialog/styles';
import Text from '@app/components/Text';
import {IS_IOS} from '@app/helpers/Constants';
import {Colors} from '@app/styles';
import {Typography} from '@app/styles/index';

const Dialog = ({
  visible,
  secondButtonLabel,
  onPressSecondButton,
  buttonLabel,
  onPressButton,
  message = '',
  children,
  paddingHorizontal = 10,
  btnBorderRadius = 15,
  textTransform = 'uppercase',
}) => {
  return (
    <Modal visible={visible} transparent>
      <CustomView
        flex
        horizontalCenter
        verticalCenter
        backgroundColor={'rgba(52, 52, 52, 0.8)'}>
        <CustomView
          width={'90%'}
          paddingVertical={20}
          paddingHorizontal={paddingHorizontal}
          borderRadius={15}
          horizontalCenter
          verticalCenter
          backgroundColor={Colors.WHITE}>
          {children ? (
            children
          ) : (
            <Text center large style={[styles.frameTitle]}>
              {message}
            </Text>
          )}
          <CustomView row>
            {onPressSecondButton && (
              <CustomView horizontalCenter width={'50%'} paddingRight={5}>
                <Button
                  label={secondButtonLabel.toUpperCase()}
                  onPress={onPressSecondButton}
                  width={'100%'}
                  isUseUserFontSize={false}
                  styleProp={{
                    borderWidth: 1,
                    borderColor: Colors.BLACK,
                  }}
                />
              </CustomView>
            )}
            <CustomView
              horizontalCenter
              width={onPressSecondButton ? '50%' : '100%'}
              paddingLeft={5}>
              <Button
                label={
                  textTransform === 'uppercase'
                    ? buttonLabel.toUpperCase()
                    : buttonLabel
                }
                onPress={onPressButton}
                width={'100%'}
                isUseUserFontSize={false}
                textStyleProp={{color: Colors.WHITE}}
                styleProp={{
                  backgroundColor: Colors.PRIMARY,
                  fontWeight: !IS_IOS ? 'bold' : null,
                  ...Typography.FONT_BOLD,
                }}
                borderRadius={btnBorderRadius}
              />
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

export default Dialog;
