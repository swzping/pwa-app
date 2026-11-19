import {gql} from '@apollo/client';

/** My Account 等仅需进度条时使用，减轻 payload */
export const GET_GAMIFICATION_CAMPAIGN_PROGRESS = gql`
  query GetGamificationCampaignProgress {
    gamificationCampaign {
      campaign_progress_status
      is_reward_claimed
      tasks {
        status
      }
    }
  }
`;

export const GET_GAMIFICATION_CAMPAIGN = gql`
  query GetGamificationCampaign {
    gamificationCampaign {
      campaign_progress_status
      is_reward_claimed
      banner_url
      tasks {
        label
        status
        icon
        action_link
        task_type
      }
    }
  }
`;

export const CLAIM_GAMIFICATION_VOUCHER = gql`
  mutation ClaimGamificationVoucher {
    claimGamificationVoucher {
      success
      message
    }
  }
`;
