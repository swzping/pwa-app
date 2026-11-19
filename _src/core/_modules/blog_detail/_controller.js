import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_BLOG_BY_ID} from '@app/_modules/blog_detail/services/schema';

import Views from '@app/_modules/blog_detail/_view';
import {modules} from '@root/swift.config';

const BlogDetail = props => {
  if (!modules.blog_detail.enable) {
    return null;
  }

  const {blogId} = props.route.params;

  const [blogDetail, setBlogDetail] = useState(null);

  const {data: blogData, loading: blogLoading} = useCustomQuery({
    schema: GET_BLOG_BY_ID,
    useInitData: true,
    variables: {blogId},
  });

  useEffect(() => {
    if (blogData?.data?.getBlogByFilter?.items[0]) {
      setBlogDetail(blogData?.data?.getBlogByFilter?.items[0]);
    }
  }, [blogData]);

  return <Views {...props} blogDetail={blogDetail} blogLoading={blogLoading} />;
};

export default BlogDetail;
