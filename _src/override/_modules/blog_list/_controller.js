import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {
  GET_ALL_BLOG,
  GET_BLOG_CATEGORY,
  GET_BLOG_LIST,
} from '@app/_modules/blog_list/services/schema';

import Views from '@app/_modules/blog_list/_view';
import {modules} from '@root/swift.config';
import {navigateTo} from '@app/helpers/Navigation';

const BlogList = props => {
  if (!modules.blog_list.enable) {
    return null;
  }

  // const {params} = props.route;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [blogList, setBlogList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [variables, setVariables] = useState({
    // category_id: params.categoryId || 0,
    category_id: 1,
    page_size: 5,
    current_page: currentPage,
    // id: 0,
  });

  const {
    data: blogListData,
    loading: blogListLoading,
    onRefetchData,
  } = useCustomQuery({
    schema: GET_ALL_BLOG,
    useInitData: true,
    variables,
  });

  const {data: blogCategory} = useCustomQuery({
    schema: GET_BLOG_CATEGORY,
    useInitData: true,
  });

  const {data: recentBlog, loading: isLoadingBlog} = useCustomQuery({
    schema: GET_BLOG_LIST,
    useInitData: true,
    variables: {
      page_size: 5,
      current_page: 1,
    },
  });

  useEffect(() => {
    if (blogListData?.data?.getBlogByFilter?.items && blogCategory?.data) {
      if (!noMoreData) {
        const {items, total_count} = blogListData?.data?.getBlogByFilter;
        const currentData = blogList;
        const {data} = blogCategory?.data?.getBlogCategory;
        let tmpData = [];
        let newData = [];
        for (let i = 0; i < items.length; i++) {
          let newItems = [];
          if (items[i].category_ids.length > 0) {
            let tmpCategoryId = [];
            for (let o = 0; o < items[i].category_ids.length; o++) {
              tmpCategoryId.push(
                data.find(e => e.id === items[i].category_ids[o]),
              );
            }
            newItems = {categoryIds: tmpCategoryId, ...items[i]};
          } else {
            newItems = {...items[i]};
          }
          tmpData.push(newItems);
        }
        if (currentPage > 1) {
          newData = [...currentData, ...tmpData];
          if (total_count === newData.length) {
            setNoMoreData(true);
          }
        } else {
          newData = tmpData;
        }
        setCategoryList(data);
        setTotalCount(total_count);
        setBlogList(newData);
      }
    }
  }, [blogListData, blogCategory]);

  const onLoadMore = () => {
    if (!blogListLoading) {
      if (totalCount > blogList.length) {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);

        const variablesTmp = {
          ...variables,
          current_page: newPage,
        };
        setVariables(variablesTmp);
        onRefetchData({params: variablesTmp});
      } else {
        setNoMoreData(true);
      }
    }
  };

  const onRefresh = async () => {
    const variablesTmp = {
      ...variables,
      current_page: 1,
    };
    await setRefreshing(true);
    await setBlogList([]);
    await setCurrentPage(1);
    await setNoMoreData(false);
    await setVariables(variablesTmp);
    await setRefreshing(false);
    onRefetchData({params: variablesTmp});
  };

  /**
   * ----------------------------------------- *
   * @function onPressCart
   * @summary navigate to Cart
   * ----------------------------------------- *
   */
  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  /**
   * ----------------------------------------- *
   * @function onPressBlog
   * @summary navigate to Blog Detail
   * ----------------------------------------- *
   */
  const onPressBlog = ({id, categoryIds}) => {
    navigateTo(modules.blog_detail.enable, modules.blog_detail.name, {
      blogId: id,
      categoryIds,
    });
  };

  const onPressCategory = id => {
    setCurrentPage(1);
    setNoMoreData(false);
    onRefetchData({params: {...variables, category_id: id, current_page: 1}});
  };

  return (
    <Views
      {...props}
      blogList={blogList}
      blogListLoading={blogListLoading}
      noMoreData={noMoreData}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onLoadMore={onLoadMore}
      onPressCart={onPressCart}
      onPressBlog={onPressBlog}
      onPressCategory={onPressCategory}
      categoryList={categoryList}
      recentBlog={recentBlog?.data?.getBlogList?.items}
      isLoadingBlog={isLoadingBlog}
    />
  );
};

export default BlogList;
