import React from 'react';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';

const CardSection = ({title, content = null, children = null}) => {
  return (
    <CustomView
      verticalCenter
      padding={20}
      marginBottom={15}
      backgroundColor={'#F2F0ED'}
      style={{minHeight: 150}}>
      <Text bold center xlarge style={{marginBottom: 10}}>
        {title}
      </Text>
      {content ? <Text center>{content}</Text> : children()}
    </CustomView>
  );
};

export default CardSection;
