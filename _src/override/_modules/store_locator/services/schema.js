import {gql} from '@apollo/client';

export const STORE_LOCATION = gql`
  query storeLocation {
    storeLocation {
      items {
        address
        baseimage
        city
        email
        link
        latitude
        longitude
        phone
        store_name
        store_description
        zipcode
      }
    }
  }
`;
