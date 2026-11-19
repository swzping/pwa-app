import {gql} from '@apollo/client';
export const CHANGE_PASSWORD = gql`
    mutation ChangePassword(
    $currentPassword: String!, 
    $newPassword: String!
    ) {
    changeCustomerPasswordLr(
        currentPassword: $currentPassword,
        newPassword: $newPassword,   
    ) {
        id
        customer_email
    }
}
`;
