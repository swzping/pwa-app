import React, {useState} from 'react';
import {normalize} from '@app/styles/mixins';
import {Colors} from '@app/styles';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import ShareButton from '@app/components/ShareButton';
import {rxUserTheme} from '@app/services/cache';

import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {useReactiveVar} from '@apollo/client';
import {socialShares} from '@root/swift.config';

const SocialShareBlock = ({url, title, message}) => {
  const [showMore, setShowMore] = useState(false);
  const scheme = useReactiveVar(rxUserTheme);

  return (
    <CustomView row spaceBetween horizontalCenter marginHorizontal={10}>
      <CustomView
        border={1}
        borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
        borderRadius={15}
        padding={5}
        marginHorizontal={10}
        onPress={() => setShowMore(!showMore)}>
        <AntDesignIcon
          name={showMore ? 'right' : 'sharealt'}
          size={normalize(20)}
        />
      </CustomView>
      <RenderIf condition={showMore}>
        <ShareButton url={url} title={title} message={message} />
        {socialShares.map((social, index) => {
          return (
            <ShareButton
              key={`social-share-${index}`}
              url={url}
              title={title}
              type={social}
              message={message}
            />
          );
        })}
      </RenderIf>
    </CustomView>
  );
};

export default SocialShareBlock;
