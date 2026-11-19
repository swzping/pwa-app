import React from 'react';
import {Modal} from 'react-native';

import Button from '@app/components/Button/index';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

const WellnessProfileModal = ({
  title,
  subtitle,
  buttonDisabled = false,
  buttonLabel = 'OK',
  visible,
  onClose,
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
          paddingHorizontal={0}
          borderRadius={15}
          horizontalCenter
          verticalCenter
          backgroundColor={Colors.WHITE}>
          <Text
            style={{
              paddingHorizontal: 20,
              fontSize: 18,
              textAlign: 'center',
              fontFamily: 'Gilroy',
              fontWeight: '700',
              color: '#1b1a19',
            }}>
            {title}
          </Text>
          <Text
            style={{
              paddingHorizontal: 20,
              marginTop: 8,
              marginBottom: 24,
              fontFamily: 'Gilroy',
              fontWeight: '500',
              fontSize: 14,
              lineHeight: 20,
              textAlign: 'center',
              color: '#757575',
            }}>
            {subtitle}
          </Text>
          <CustomView
            row
            style={{
              borderTopWidth: 1,
              borderColor: '#E5E5E5',
              paddingTop: 12,
            }}>
            <CustomView
              horizontalCenter
              width={'100%'}
              style={{paddingHorizontal: 16}}>
              <Button
                disabled={buttonDisabled}
                label={buttonLabel}
                onPress={onClose}
                width={'100%'}
                isUseUserFontSize={false}
                textStyleProp={{color: Colors.WHITE}}
                styleProp={{
                  backgroundColor: Colors.PRIMARY,
                  fontWeight: '700',
                  opacity: buttonDisabled ? 0.7 : 1,
                }}
                borderRadius={8}
              />
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

export default WellnessProfileModal;
