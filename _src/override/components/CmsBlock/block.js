import React from 'react';
import PageBuilder from '@app/components/Cms';

const Block = ({content}) => {
  return <PageBuilder htmlStr={content} useFlashList={false} />;
};

export default Block;
