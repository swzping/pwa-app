import gql from 'graphql-tag';

export const GET_CORE_CONFIG = gql`
  query getCoreConfig($path: String!, $key: String!) {
    getCoreConfig(path: $path, key: $key) {
      code
      status
      message
      data {
        core_name
        core_value
      }
    }
  }
`;

export const GET_STORE_CONFIG = gql`
  query StoreConfig {
    storeConfig {
      is_maintenance
      shipments_configuration
      payments_configuration
      snap_is_production
      free_shipping_threshold
      login_radius_sms_enabled
      dfi_becon_customer_enabled
      waiting_room_expire_time
      dfi_event_booking_app_enabled
      dfi_event_booking_category_selection_timeout
      dfi_event_booking_checkout_guardian_run_event_id
    }
  }
`;
