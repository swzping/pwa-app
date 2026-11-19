import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_CMS_PAGE = gql(
  filterGraphql(`
  query CmsPage($identifier: String) {
    cmsPage(identifier: $identifier) {
      title
      app_content
    }
  }
`),
);

export const GET_COMMON_CMS_PAGE = gql(
  filterGraphql(`
    query CmsAppContentPage($identifier: String!, $is_home: Boolean!, $v: Int) {
        cmsPageAppContent(identifier: $identifier, is_home: $is_home, v: $v) {
            page_json_content
            title
        }
    }
`),
);

export const GET_CMS_BLOCKS = gql(
  filterGraphql(`
  query CmsBlocks($identifiers: [String]) {
    cmsBlocks(identifiers: $identifiers) {
      items {
        content
      }
    }
  }
`),
);

export const GET_COMMON_CMS_BLOCKS = gql(
  filterGraphql(`
  query cmsBlockAppContent($identifier: String) {
    cmsBlockAppContent(
      identifier: $identifier
      ) {
      title
      identifier
      block_json_content
      __typename
    }
  }
`),
);
