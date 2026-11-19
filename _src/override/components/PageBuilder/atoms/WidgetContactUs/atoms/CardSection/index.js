import React from 'react';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import SocialMediaButton from '@app/_modules/auth_signin/atoms/SocialMediaButton';
import RenderIf from '@root/_src/core/components/RenderIf/index';

const socialMedia = [
  {type: 'instagram', icon: 'instagram', url: null},
  {type: 'facebook', icon: 'facebook-f', url: null},
  {type: 'twitter', icon: 'twitter', url: null},
  {type: 'youtube', icon: 'youtube', url: null},
  {type: 'tiktok', icon: 'tiktok', url: null},
];

const CardSection = ({title, content = []}) => {
  const GetInTouchChildren = () => {
    return (
      <CustomView row verticalCenter marginTop={5}>
        <RenderIf condition={content.length > 0}>
          {content.map((item, index) => (
            <SocialMediaButton key={index} item={item} />
          ))}
        </RenderIf>
        <RenderIf condition={content.length === 1}>
          {socialMedia.map((item, index) => (
            <SocialMediaButton key={index} item={item} />
          ))}
        </RenderIf>
      </CustomView>
    );
  };

  const renderContent = () => {
    if (title.toLowerCase() === 'get in touch') {
      return <GetInTouchChildren />;
    }

    return content.map((value, index) => {
      return (
        <Text key={`content-value-${index}`} center>
          {value}
        </Text>
      );
    });
  };

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
      {renderContent()}
    </CustomView>
  );
};

export default CardSection;
