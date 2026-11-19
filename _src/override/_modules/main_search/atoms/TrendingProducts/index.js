import React from 'react';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import PageBuilder from '@app/components/Cms';
import styles from './styles';

const TrendingProducts = ({cmsContent}) => {
  if (!cmsContent) {
    return null;
  }
  
  return (
    <CustomView style={styles.container}>
      <Text bold style={styles.title}>
        Trending products
      </Text>
      <PageBuilder 
        htmlStr={cmsContent} 
        noPadding={true} 
        useFlashList={false} 
      />
    </CustomView>
  );
};

export default TrendingProducts;

