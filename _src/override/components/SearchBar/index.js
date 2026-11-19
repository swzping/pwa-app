import React, {useEffect, useRef, useState} from 'react';
import {TextInput, TouchableOpacity} from 'react-native';

import {Appbar} from 'react-native-paper';
import IconIon from 'react-native-vector-icons/Ionicons';

import {useNavigation} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

import NotificationIcon from '@app/assets/svgs/Notification';
import ScanIcon from '@app/assets/svgs/Scan';
import SearchIcon from '@app/assets/svgs/SearchIconV2';
import CustomView from '@app/components/CustomView';
import styles from '@app/components/SearchBar/styles';
import {navigateTo,pushTo} from '@app/helpers/Navigation';
import {Colors} from '@app/styles';
import {isIOS} from '@app/styles/mixins.new';

const SearchBar = ({
  useSearch,
  searchPlaceholder,
  onChangeText,
  onPressSearch,
  outStyles,
  // shared keyword slot, consumed differently per variant:
  // - touch variant (result pages): read-only echo, tap falls
  //   through to the wrapper -> main search
  // - useSearch variant (main search): prefill, read once on mount
  searchValue,
  showScanIcon = false,
  showNotificationIcon = false,
  onScanGuideClose,
  onPressNotification,
}) => {
  /**
   * ---------------------------------------------------- *
   * @constant {hooks}
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const navigation = useNavigation();
  const searchInputRef = useRef(null);
  const mount = useRef();
  const [inputValue, setInputValue] = useState(searchValue || '');

  /**
   * ---------------------------------------------------- *
   * @constant {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;
    if (mount.current) {
      searchInputRef?.current?.focus();
    }
    return () => (mount.current = false);
  }, []);
  /**
   * ----------------------------------------- *
   * @function onNavigateToMainSearch
   * @summary navigate to main search
   * ----------------------------------------- *
   */
  const onNavigateToMainSearch = () => {
    pushTo(navigation, modules.main_search.enable, modules.main_search.name, {
      searchPlaceholder,
      // echo the current keyword so main search prefills its input
      searchKeyword: searchValue || undefined,
    });
  };

  const onNavigateToScanner = () => {
    onScanGuideClose?.();
    navigateTo(modules.scanner.enable, modules.scanner.name);
  };
  const onNavigateToNotifications = () => {
    navigateTo(
      modules.account_notification.enable,
      modules.account_notification.name,
    );
  };
  const onKeyboardPress = event => {
    if (event.key === 'Enter') {
      onPressSearch();
    }
  };

  if (useSearch) {
    return (
      <CustomView row horizontalCenter padding={8}>
        <CustomView width={'15%'}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        </CustomView>
        <CustomView
          row
          spaceBetween
          horizontalCenter
          width={'85%'}
          style={styles.frameSearchUserSearchWrapper}>
          <CustomView style={{paddingLeft: 10}}>
            <SearchIcon width={20} height={20} />
          </CustomView>
          <CustomView flex={1} paddingLeft={5} paddingRight={10}>
            <TextInput
              ref={searchInputRef}
              value={inputValue}
              editable={true}
              style={styles.frameSearchTextUseSearch}
              placeholder={searchPlaceholder ?? t('textPlaceholder.search')}
              onChangeText={text => {
                setInputValue(text);
                onChangeText(text);
              }}
              onSubmitEditing={onPressSearch}
              onKeyPress={onKeyboardPress}
              returnKeyType="search"
            />
          </CustomView>
          <CustomView
            horizontalCenter
            style={{marginRight: 10}}
            onPress={() => {
              setInputValue('');
              onChangeText('');
            }}>
            <IconIon
              name={'close-circle'}
              color={Colors.GRAY_MEDIUM}
              size={22}
            />
          </CustomView>
        </CustomView>
      </CustomView>
    );
  }

  return (
    <CustomView style={[styles.frameSearchbar, outStyles]}>
      <TouchableOpacity onPress={onNavigateToMainSearch}>
        <CustomView style={styles.frameSearchInput}>
          <CustomView style={{paddingLeft: 10}}>
            <SearchIcon width={20} height={20} />
          </CustomView>
          <TextInput
            editable={isIOS ? true : false}
            onFocus={onNavigateToMainSearch}
            style={styles.frameSearchText}
            placeholder={searchPlaceholder ?? t('textPlaceholder.search')}
            value={searchValue || undefined}
            placeholderTextColor={Colors.GRAY_MEDIUM}
          />
          {showNotificationIcon && (
            <TouchableOpacity
              onPress={onPressNotification || onNavigateToNotifications}
              style={{paddingHorizontal: 6}}>
              <NotificationIcon width={22} height={22} />
            </TouchableOpacity>
          )}
          {showScanIcon && (
            <TouchableOpacity onPress={onNavigateToScanner}>
              <ScanIcon />
            </TouchableOpacity>
          )}
        </CustomView>
      </TouchableOpacity>
    </CustomView>
  );
};

SearchBar.propTypes = {
  // use for displaying search can be input:true or touch:false
  useSearch: PropTypes.bool,
  // shared keyword slot: touch variant = read-only echo (controlled);
  // useSearch variant = mount-time prefill (useState initial value)
  searchValue: PropTypes.string,
};

export default SearchBar;
