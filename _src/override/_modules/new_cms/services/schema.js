import gql from 'graphql-tag';
import {filterGraphql} from '@app/services/helper';

export const GET_CMS_PAGE_WITH_APP_CONTENT = gql(
  filterGraphql(`
    query CmsAppContentPage($identifier: String!, $is_home: Boolean!) {
        cmsPageAppContent(identifier: $identifier, is_home: $is_home) {
            page_json_content
            title
        }
    }
  `),
);
