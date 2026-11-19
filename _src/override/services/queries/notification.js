import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_NOTIFICATION_CATEGORY = gql(
  filterGraphql(`
  query GetNotificationCategory {
    getNotificationCategory {
      code
      label
    }
  }
`),
);

export const GET_NOTIFICATIONS = gql(
  filterGraphql(`
query(
  $notificationType: String,
  $pageSize: Int, 
  $currentPage: Int, 
  $notificationSortCode: String,
  $notificationSortDirection: SortEnum
) {
  getNotifications(
    notification_type: $notificationType,
    pageSize: $pageSize,
    currentPage: $currentPage,
    sort: { code: $notificationSortCode, direction: $notificationSortDirection }
  ) {
    total_count
    currentPage
    total_pages
    has_unread
    sort_by {
      code
      direction
    }
    notifications {
      publish_id
      notification_id
      template_name
      category_type
      title
      start_date
      end_date
      description
      icon
      redirect_url
      is_read
      read_at
      priority
      target_type
      created_at
    }
  }
}
`),
);

export const COUNT_UNREAD_NOTIFICATIONS = gql(
  filterGraphql(`
query countUnreadNotifications {
  getNotifications {
    total_unread
    __typename
  }
}
`),
);

export const UPDATE_NOTIFICATION = gql(
  filterGraphql(`
query UpdateNotification($publish_id: Int!, $action: MarkNotificationAction!) {
  updateNotification(publish_id: $publish_id, action: $action)
}
`),
);

export const VIEW_NOTIFICATION = gql(
  filterGraphql(`
query ViewNotification($publishId: Int!) {
  viewNotification(publish_id: $publishId) {
    redirect_url
    category_type
    redirection_type
    description
    start_date
    end_date
    image
    title
  }
}
`),
);

