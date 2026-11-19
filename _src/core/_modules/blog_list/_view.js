import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {Mixins} from '@app/styles';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';

import BlogItem from '@app/_modules/blog_list/atoms/BlogItem/index';

const BlogListScreen = ({
  blogListLoading,
  blogList,
  onLoadMore,
  noMoreData,
  refreshing,
  onRefresh,
}) => {
  const {t} = useTranslation();
  const FooterElement = () => {
    if (blogListLoading) {
      return <ActivityIndicator />;
    }

    return (
      <CustomView
        horizontalCenter
        verticalCenter
        width={Mixins.MAX_WIDTH}
        paddingVertical={20}>
        <RenderIf condition={noMoreData}>
          <Text>{t('blog_list.view.noMoreData')}</Text>
        </RenderIf>
      </CustomView>
    );
  };

  return (
    <SafeAreaView>
      <NavBar useBack title={t('label.newsArticle')} />
      <FlatList
        data={blogList}
        renderItem={({item}) => <BlogItem blog={item} />}
        keyExtractor={item => item.id}
        ListFooterComponent={FooterElement}
        ListFooterComponentStyle={{alignSelf: 'center'}}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default BlogListScreen;
