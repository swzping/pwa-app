import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_BLOG_BY_ID} from '@app/_modules/blog_detail/services/schema';
import {
  GET_ALL_BLOG,
  GET_BLOG_CATEGORY,
} from '@app/_modules/blog_list/services/schema';

import Views from '@app/_modules/blog_detail/_view';
import {modules} from '@root/swift.config';
import {navigateTo} from '@app/helpers/Navigation';

const BlogDetail = props => {
  if (!modules.blog_detail.enable) {
    return null;
  }

  const {blogId, categoryIds} = props.route.params;

  const [blogDetail, setBlogDetail] = useState(null);

  const [blogList, setBlogList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const {data: blogData, loading: blogLoading} = useCustomQuery({
    schema: GET_BLOG_BY_ID,
    useInitData: true,
    variables: {blogId},
  });

  const {data: blogListData} = useCustomQuery({
    schema: GET_ALL_BLOG,
    useInitData: true,
    variables: {
      category_id: 1,
      page_size: 5,
      current_page: 1,
    },
  });

  const {data: blogCategory} = useCustomQuery({
    schema: GET_BLOG_CATEGORY,
    useInitData: true,
  });

  useEffect(() => {
    if (blogData?.data?.getBlogByFilter?.items[0]) {
      setBlogDetail(blogData?.data?.getBlogByFilter?.items[0]);
    }
  }, [blogData]);

  useEffect(() => {
    if (blogListData?.data?.getBlogByFilter?.items && blogCategory?.data) {
      const {items} = blogListData?.data?.getBlogByFilter;
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
      newData = tmpData;
      setCategoryList(data);
      setBlogList(newData);
    }
  }, [blogListData, blogCategory]);

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
  const onPressBlog = ({id, categoryId}) => {
    navigateTo(modules.blog_detail.enable, modules.blog_detail.name, {
      blogId: id,
      categoryIds: categoryId,
    });
  };

  /**
   * ----------------------------------------- *
   * @function onPressBlog
   * @summary navigate to Blog Detail
   * ----------------------------------------- *
   */
  const onPressCategory = id => {
    navigateTo(modules.blog_list.enable, modules.blog_list.name, {
      categoryId: id,
    });
  };

  return (
    <Views
      {...props}
      blogDetail={blogDetail}
      blogLoading={blogLoading}
      onPressCart={onPressCart}
      categoryIds={categoryIds}
      blogList={blogList}
      categoryList={categoryList}
      onPressBlog={onPressBlog}
      onPressCategory={onPressCategory}
    />
  );
};

export default BlogDetail;
