import React from 'react';
import {Text} from 'react-native';

import {PropTypes} from 'prop-types';

import Dialog from '@app/components/Dialog';

const CustomDialog = ({
  title,
  subtitle,
  buttonLabel = 'Back',
  visible,
  onClose,
}) => {
  return (
    <Dialog
      paddingHorizontal={20}
      btnBorderRadius={8}
      visible={visible}
      buttonLabel={buttonLabel}
      textTransform="none"
      onPressButton={onClose}>
      <Text
        style={{
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
    </Dialog>
  );
};

export default CustomDialog;

CustomDialog.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  buttonLabel: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
