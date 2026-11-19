import {gql} from '@apollo/client';

export const GET_FEATURED_BRANDS = gql`
  query {
    getBrandList {
      page_size
      current_page
      total_count
      total_pages
      featured {
        attribute_id
        logo
        category_url
        name
      }
    }
  }
`;
