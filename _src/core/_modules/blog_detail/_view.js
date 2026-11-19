/* eslint-disable no-shadow */
import React from 'react';
import {ScrollView} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Mixins} from '@app/styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {
  formatDateNotif as formatDateBlog,
  trimHTMLTags,
} from '@app/helpers/General';

import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import SocialShareBlock from '@app/components/SocialShareBlock';
import Text from '@app/components/Text';
import Config from 'react-native-config';
import FastImage from '@d11/react-native-fast-image';
import styles from '@app/_modules/blog_detail/styles';

const BlogDetailScreen = ({blogDetail, blogLoading}) => {
  const {t} = useTranslation();
  const BlogDetail = ({blogDetail, blogLoading}) => {
    if (!blogDetail) {
      if (blogLoading) {
        return (
          <CustomView flex horizontalCenter verticalCenter>
            <ActivityIndicator />
          </CustomView>
        );
      } else {
        return (
          <CustomView flex horizontalCenter verticalCenter>
            <Text>{t('blog_detail.view.noDetail')}</Text>
          </CustomView>
        );
      }
    } else {
      return (
        <ScrollView>
          <FastImage
            key={blogDetail.id}
            style={styles.blogImageContainer}
            resizeMode={FastImage.resizeMode.stretch}
            source={{
              uri: blogDetail.featured_image_url,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
          />
          <CustomView horizontalStart marginVertical={10}>
            <CustomView row spaceBetween width={Mixins.MAX_WIDTH}>
              <CustomView horizontalStart marginHorizontal={20}>
                <Text bold large>
                  {blogDetail.title}
                </Text>
                <Text small>{formatDateBlog(blogDetail.created_at)}</Text>
              </CustomView>

              <SocialShareBlock
                url={`${Config.PWA_BASE_URL}/blog/${blogDetail.url_key}`}
                title={blogDetail.title}
                message={t('blog_detail.view.checkArticle')}
              />
            </CustomView>

            <CustomView marginVertical={10} marginHorizontal={20}>
              <Text small>{trimHTMLTags(blogDetail.content)}</Text>
            </CustomView>
          </CustomView>
        </ScrollView>
      );
    }
  };

  return (
    <SafeAreaView>
      <NavBar useBack title={t('label.newsArticle')} />
      <BlogDetail blogDetail={blogDetail} blogLoading={blogLoading} />
    </SafeAreaView>
  );
};

export default BlogDetailScreen;
