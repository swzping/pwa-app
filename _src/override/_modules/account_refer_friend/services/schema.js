import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_REFERAL_LINK_INFO = gql(
  filterGraphql(`
  {
    getReferralLinkInfo {
      info_advocate {
        balance_expired
        cumulative_balance
        invited_friends_count
      }
      info_rule {
        advocate_off_text
        friend_off_text
        is_registration_required
        registration_required_text
      }
      invite_url
      is_email_subscription
      message
      reward_message
      status
    }
  }
`),
);

export const IS_REFERAL_GENERATED = gql(
  filterGraphql(`
  {
    isReferralInfoGenerated
  }
`),
);
export const GENERATE_REFERAL = gql(
  filterGraphql(`
    mutation {
      generateReferralInfo {
        status
        info_rule {
          is_registration_required
          registration_required_text
          advocate_off_text
          friend_off_text
          __typename
        }
        info_advocate {
          invited_friends_count
          balance_expired
          cumulative_balance
          __typename
        }
        reward_message
        invite_url
        is_email_subscription
        __typename
      }
    }
  `),
);
