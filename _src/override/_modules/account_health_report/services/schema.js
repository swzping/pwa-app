import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_HEALTH_CHECKS = gql(
  filterGraphql(`
    query getHealthChecks(
      $pageSize: Int
      $currentPage: Int
    ) {
      getHealthChecks(
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        total_count
        currentPage
        total_pages
        sort_by {
          code
          direction
        }
        healthchecks {
            entity_id
            is_read
            title
            activity
            check_type
            check_date
        }
      }
    }
  `),
);

export const VIEW_HEALTH_CHECK = gql(
  filterGraphql(`
    query viewHealthCheck($entityId: Int!) {
      viewHealthCheck(entity_id: $entityId) {
        entity_id
        title
        ref
    
        birthday
        gender
        activity
        check_type
        check_date
        phone_number
        customer_name
        blood_pressure
        blood_glucose
        uric_acid
        cholesterol
        cholesterol_hdl
        cholesterol_ldl
        triglyceride
        hemoglobin
        store {
          store_code
          store_name
          store_address
          store_phone
        }
      }
    }
  `),
);

