// GraphQL queries are disabled - using mock data instead
// import {gql} from '@apollo/client';
// import {filterGraphql} from '@app/services/helper';

// export const GET_NOTIFICATIONS = gql(
//   filterGraphql(`
//     query {
//       customerNotificationList {
//         items {
//           createdAt
//           entityId
//           subject
//           unread
//           content
//         }
//       }
//     }
//   `),
// );

// export const READ_NOTIFICATION = gql(
//   filterGraphql(`
//     mutation readNotification($entityId: Int!) {
//       readNotification(entityId: $entityId) {
//         items {
//           content
//           createdAt
//           subject
//           unread
//         }
//       }
//     }
//   `),
// );

// Placeholder exports to prevent import errors
export const GET_NOTIFICATIONS = null;
export const READ_NOTIFICATION = null;

