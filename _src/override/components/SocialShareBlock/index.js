import React from 'react';
import CustomView from '@app/components/CustomView';
import ShareButton from '@app/components/ShareButton/index';
// import {socialShares} from '@root/swift.config';

const SocialShareBlock = ({url, title, sku, message, defaultTitle}) => {
  return (
    <CustomView row spaceBetween horizontalCenter>
      <ShareButton
        url={url}
        title={title}
        sku={sku}
        message={message}
        defaultTitle={defaultTitle}
      />
      {/*{socialShares.map((social, index) => {*/}
      {/*  return (*/}
      {/*    <ShareButton*/}
      {/*      key={`social-share-${index}`}*/}
      {/*      url={url}*/}
      {/*      title={title}*/}
      {/*      type={social}*/}
      {/*      message={message}*/}
      {/*    />*/}
      {/*  );*/}
      {/*})}*/}
    </CustomView>
  );
};

export default SocialShareBlock;
