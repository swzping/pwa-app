import gql from 'graphql-tag';

export const INSERT_FCM_TOKEN = gql`
  mutation insertFcmToken($deviceToken: String!, $fcmToken: String!) {
    insertFcmToken(deviceToken: $deviceToken, fcmToken: $fcmToken) {
      init
    }
  }
`;
export const UPDATE_FCM_TOKEN = gql`
  mutation updateFcmToken($deviceToken: String!, $fcmToken: String!) {
    updateFcmToken(deviceToken: $deviceToken, fcmToken: $fcmToken)
  }
`;

export const REMOVE_FCM_TOKEN = gql`
  mutation removeFcmToken($deviceToken: String!) {
    removeFcmToken(deviceToken: $deviceToken)
  }
`;
