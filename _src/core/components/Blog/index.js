/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import useCustomQuery from '@app/hooks/useCustomQuery';
import { Colors, MixinsNew } from '@app/styles';
import { navigateTo } from '@app/helpers/Navigation';
import { modules } from '@root/swift.config';
import { useTranslation } from 'react-i18next';
import {
  Text,
  Button,
  ActivityIndicator,
  TouchableRipple,
  MD2Colors as ColorsPaper,
} from 'react-native-paper';
import {
  GET_BLOG_BY_FILTER,
  GET_BLOG_CATEGORY,
} from '@app/_modules/blog_list/services/schema';

import CustomView from '@app/components/CustomView';
import BlogItem from '@app/_modules/blog_list/atoms/BlogItem';
import styles from '@app/components/Blog/styles';
import { Mixins } from '../../styles/index';

const Blog = () => {
  const { t } = useTranslation();
  const [blogCategories, setBlogCategories] = useState([]);
  const [blogList, setBlogList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [variables, setVariables] = useState({
    categoryId: selectedCategory,
    pageSize: 3,
    currentPage: 1,
  });

  const { data: blogCategoryData, loading: blogCategoryLoading } = useCustomQuery(
    { schema: GET_BLOG_CATEGORY, useInitData: true },
  );

  const {
    data: blogListData,
    loading: blogListLoading,
    onRefetchData: onRefetchBlogList,
  } = useCustomQuery({
    schema: GET_BLOG_BY_FILTER,
    useInitData: true,
    variables: variables,
  });

  useEffect(() => {
    if (blogCategoryData?.data?.getBlogCategory?.data) {
      setBlogCategories(blogCategoryData?.data.getBlogCategory.data);
    }
  }, [blogCategoryData]);

  useEffect(() => {
    if (blogListData?.data?.getBlogByFilter?.items) {
      setBlogList(blogListData?.data?.getBlogByFilter?.items);
    }
  }, [blogListData]);

  const BlogCategories = ({ selectedCategory }) => {
    const selectCategory = category => {
      let categoryId = 0;
      if (selectedCategory !== category.id) {
        categoryId = category.id;
      }
      const newVariables = { ...variables, categoryId: categoryId };
      setVariables(newVariables);
      setSelectedCategory(categoryId);
      onRefetchBlogList({ params: newVariables });
    };

    if (!blogCategoryLoading) {
      if (blogCategories.length) {
        return (
          <ScrollView horizontal style={styles.categoryRowContainer}>
            {blogCategories.map((category, index) => {
              const isSelected = selectedCategory === category.id;
              const fontWeight = isSelected ? { fontWeight: 'bold' } : {};
              return (
                <Button
                  key={'category-blog-' + index}
                  mode="contained"
                  onPress={() => selectCategory(category)}
                  style={[
                    styles.btnCategory,
                    {
                      backgroundColor: isSelected
                        ? Colors.PRIMARY
                        : ColorsPaper.grey300,
                    },
                  ]}>
                  <Text
                    style={{
                      ...fontWeight,
                      color: isSelected
                        ? ColorsPaper.white
                        : ColorsPaper.grey500,
                    }}>
                    {category.name}
                  </Text>
                </Button>
              );
            })}
          </ScrollView>
        );
      } else {
        return (
          <CustomView>
            <Text>No Blog Category available</Text>
          </CustomView>
        );
      }
    } else {
      return (
        <CustomView>
          <ActivityIndicator />
        </CustomView>
      );
    }
  };

  const BlogList = () => {
    if (!blogListLoading) {
      if (blogList.length) {
        return blogList.map((blog, index) => {
          return <BlogItem key={'blog-' + index} blog={blog} />;
        });
      } else {
        return (
          <CustomView>
            <Text>No Blog available</Text>
          </CustomView>
        );
      }
    } else {
      return (
        <ActivityIndicator
          style={{ ...MixinsNew.margin({ top: 40, bottom: 30 }) }}
        />
      );
    }
  };

  return (
    <>
      <CustomView
        width={Mixins.MAX_WIDTH}
        horizontalStart
        paddingHorizontal={20}
        paddingVertical={10}>
        <Text bold>{t('label.newsArticle')}</Text>
      </CustomView>
      <BlogCategories selectedCategory={selectedCategory} />
      <BlogList />
      <TouchableRipple
        style={{ alignSelf: 'center', ...MixinsNew.padding(10) }}
        onPress={() =>
          navigateTo(modules.blog_list.enable, modules.blog_list.name, {
            categoryId: selectedCategory,
          })
        }>
        <Text>{t('label.viewMore')}</Text>
      </TouchableRipple>
    </>
  );
};

export default Blog;
