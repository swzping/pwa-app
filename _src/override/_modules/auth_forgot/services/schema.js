import gql from 'graphql-tag';

export const FORGOT_PASSWORD = gql`
  mutation requestPasswordResetEmail($email: String!) {
    requestPasswordResetEmail(email: $email)
  }
`;
