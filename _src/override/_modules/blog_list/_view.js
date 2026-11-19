import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '@app/components/NavBar';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/index';

import BlogItem from '@app/_modules/blog_list/atoms/BlogItem/index';
import FooterBlog from '@app/_modules/blog_list/atoms/FooterBlog/index';

const BlogListScreen = ({
  blogList,
  onLoadMore,
  isLoadingBlog,
  refreshing,
  onRefresh,
  onPressCart,
  onPressBlog,
  onPressCategory,
  categoryList,
  recentBlog,
}) => {
  return (
    <>
      <NavBar
        useBack
        useWhite
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />
      <FlatList
        data={blogList}
        renderItem={({ item }) => (
          <BlogItem
            blog={item}
            onPressBlog={onPressBlog}
            onPressCategory={onPressCategory}
          />
        )}
        ListFooterComponent={
          <FooterBlog
            blog={recentBlog}
            onPressBlog={onPressBlog}
            category={categoryList}
            onPressCategory={onPressCategory}
            isLoadingBlog={isLoadingBlog}
          />
        }
        ListFooterComponentStyle={{ paddingBottom: '15%' }}
        keyExtractor={item => item.id}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </>
  );
};

export default BlogListScreen;
