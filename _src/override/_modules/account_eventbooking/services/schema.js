import {gql} from '@apollo/client';

export const EVENT_BOOKING_LIST = gql`
  query {
    eventBookingList {
      events {
        id
        event_code
        event_type
        name
        status
        tile_banner_url
        event_date_time
        location
        remaining_quota
        sort_order
      }
      empty_state {
        title
        message
      }
    }
  }
`;

export const MY_EVENT_TICKETS = gql`
  query {
    myEventTickets {
      tickets {
        ticket_id
        event_id
        event_code
        event_type
        event_name
        image_url
        event_date_time
        location
        ticket_code
        code_label
        code_timeout_hours
        status
        category_code
        attendee {
          email
          first_name
          last_name
          phone
        }
        actions {
          label
          type
          url
        }
        created_at
      }
    }
  }
`;

export const SUBMIT_EVENT_REGISTERATION = gql`
  mutation SubmitEventRegistration($input: SubmitEventRegistrationInput!) {
    submitEventRegistration(input: $input) {
      success
      result_code
      message {
        title
        body
      }
      ticket {
        ticket_id
        event_id
        event_name # Event name
        event_type
        ticket_code # Unique code
        code_label
        status
        event_date_time # Date
        location # Place
        attendee {
          # Name = first_name + last_name
          first_name
          last_name
          email
          phone
        }
        created_at
      }
      redirect {
        type
        target_ticket_id
      }
    }
  }
`;

export const EVENT_BOOKING_DETAIL = gql`
  query GetEventBookingDetailForApp($eventId: ID!) {
    eventBookingDetail(event_id: $eventId) {
      id
      event_code
      event_type
      status
      remaining_quota
      name
      event_date_time
      gate_open_time
      location
      banner_url
      app_blocks {
        block_code
        sort_order
        content {
          identifier
          block_json_content
        }
      }
      categories {
        code
        label
        remaining_quota
        is_sold_out
      }
    }
  }
`;

export const EVENT_BOOKING_ELIGIBILITY = gql`
  query CheckEventBookingEligibility($eventId: ID!, $categoryCode: String) {
    eventBookingEligibility(event_id: $eventId, category_code: $categoryCode) {
      event_id
      event_type
      category_code
      is_logged_in
      is_member
      is_qualified
      has_existing_claim_or_ticket
      event_status
      inventory_status
      threshold_amount
      remaining_amount
      currency
      cta_state {
        label
        action
        message {
          title
          body
        }
      }
      existing_ticket {
        ticket_id
        ticket_code
        code_label
        code_timeout_hours
        register_url
        status
      }
    }
  }
`;

export const CLAIM_GUARDIAN_RUNCODE = gql`
  mutation ClaimGuardianRunCode($input: ClaimGuardianRunCodeInput!) {
    claimGuardianRunCode(input: $input) {
      success
      result_code
      message {
        title
        body
      }
      ticket {
        ticket_id
        event_id
        event_type
        category_code
        ticket_code
        code_label
        created_at
        code_timeout_hours
        status
        register_url
        actions {
          label
          type
          url
        }
      }
      cta_state {
        label
        action
      }
    }
  }
`;
