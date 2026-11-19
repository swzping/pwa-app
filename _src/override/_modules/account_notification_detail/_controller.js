import React, {useEffect, useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account_notification_detail/_view';
import {modules} from '@root/swift.config';

const NotificationDetail = ({route}) => {
  if (!modules.account_notification_detail.enable) {
    return null;
  }

  const [notification, setNotification] = useState(null);
  const {i18n} = useTranslation();
  
  /**
   * Get current language for selecting title/description fields
   */
  const getCurrentLanguage = useCallback(() => {
    return i18n.language || 'en';
  }, [i18n.language]);
  
  /**
   * Map API notification data to component format
   */
  const mapNotificationData = useCallback((data) => {
    const currentLang = getCurrentLanguage();
    const isZh = currentLang === 'zh' || currentLang === 'zh-CN' || currentLang === 'zh-TW';
    
    // If data already has mapped fields (subject, content, createdAt), use it directly
    // But still need to ensure description is set and handle language-specific fields
    if (data.subject && data.content !== undefined) {
      // Merge new fields if they exist in the data
      // Ensure description is set from content or description field
      const description = data.description || data.content || 
        (isZh ? (data.description_zh || data.description) : data.description);
      
      return {
        ...data,
        image: data.image || data.imageUrl,
        startDate: data.start_date || data.startDate,
        endDate: data.end_date || data.endDate,
        description: description,
        // Ensure content is also set
        content: data.content || description,
      };
    }
    
    // Otherwise, it's API original data, need to map it
    const description = isZh ? (data.description_zh || data.description) : data.description;
    
    return {
      entityId: data.publish_id || data.entityId,
      subject: isZh ? (data.title_zh || data.title) : data.title,
      content: description,
      description: description,
      unread: data.is_read !== undefined ? !data.is_read : data.unread,
      createdAt: data.created_at || data.createdAt,
      categoryCode: data.category_type || data.categoryCode,
      // New fields from API
      image: data.image,
      startDate: data.start_date,
      endDate: data.end_date,
      redirectUrl: data.redirect_url,
      redirectionType: data.redirection_type,
    };
  }, [getCurrentLanguage]);
  
  useEffect(() => {
    if (route?.params) {
      let data = null;
      
      // Check if data is in route.params.variables (some navigation patterns)
      if (route.params.variables && typeof route.params.variables === 'object') {
        data = route.params.variables;
      } 
      // Check if data is directly in route.params (navigateTo pattern)
      else if (route.params.publish_id || route.params.entityId || route.params.subject || route.params.title) {
        data = route.params;
      }
      
      if (data) {
        const mappedData = mapNotificationData(data);
        setNotification(mappedData);
      }
    }
  }, [route, mapNotificationData]);
  
  return <Views notification={notification} />;
};

export default NotificationDetail;

