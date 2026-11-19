import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_ALL_BLOG = gql(
  filterGraphql(`
  query getAllBlog(
    $page_size: Int
    $current_page: Int
    $category_id: Int
    $id: Int
    $url_key: String
  ) {
    getBlogByFilter(
      page_size: $page_size
      current_page: $current_page
      filters: {category_id: $category_id, id: $id, url_key: $url_key}
    ) {
      page_size
      total_count
      total_pages
      current_page
      items {
        id
        author_id
        title
        blog_post_url
        category_ids
        short_content
        content
        url_key
        created_at
        updated_at
        customer_groups
        tag_names
        status
        publish_date
        featured_image_url
        meta_twitter_site
        __typename
      }
      __typename
    }
  }
`),
);

export const GET_BLOG_LIST = gql(
  filterGraphql(`
  query getBlogList($page_size: Int, $current_page: Int) {
    getBlogList(page_size: $page_size, current_page: $current_page) {
      items {
        id
        title
        url_key
        __typename
      }
      __typename
    }
  }
`),
);

export const GET_BLOG_CATEGORY = gql(
  filterGraphql(`
  {
    getBlogCategory {
      __typename
      data {
        id
        name
        url_key
      }
    }
  }
  `),
);
