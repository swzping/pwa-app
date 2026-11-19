import {gql} from '@apollo/client';

export const GET_BALANCE_POINT = gql`
  query GetPoints(
    $includeBalance: Boolean = true
    $includeExpiring: Boolean = true
  ) {
    getBalancePoint @include(if: $includeBalance) {
      success
      code
      message
      data {
        point
      }
    }
    getExpiringPoints @include(if: $includeExpiring) {
      success
      code
      message
      data {
        expiringPoint
        expiringTime
      }
    }
  }
`;

export const GET_POINT_RECORDS = gql`
  query GetPointRecords($input: PointRecordsInput) {
    getPointRecords(input: $input) {
      success
      code
      message
      data {
        page
        pageSize
        totalCount
        totalPage
        items {
          date
          signedPoint
          transactionNumber
          earnedFrom
          status
          recordType
        }
      }
    }
  }
`;
