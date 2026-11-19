import React, {useMemo, useState} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import ShimmerSkeleton from '@app/components/_ShimmerSkeleton/index';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import InputBox from '@app/components/InputBox';
import RadioButton from '@app/components/RadioButton';
import RenderIf from '@app/components/RenderIf';
import {TYPE_SHIMMER_CMS_PAGE} from '@app/helpers/Constants';
import {Colors, Mixins} from '@app/styles';

const ReturnReasonModal = ({
  t,
  visible,
  title,
  loading,
  confirmLoading = false,
  reasonList,
  setVisible,
  onOk,
}) => {
  const insets = useSafeAreaInsets();

  const [currentBtn, setCurrentBtn] = useState(null);
  const [other, setOther] = useState(null);

  const disabled = useMemo(() => {
    if (confirmLoading) {
      return true;
    }
    if (currentBtn === reasonList.length - 1) {
      return !other;
    }
    return currentBtn === null || currentBtn < 0;
  }, [confirmLoading, currentBtn, other, reasonList.length]);

  const handleConfirm = () => {
    if (confirmLoading) {
      return;
    }
    onOk({...reasonList[currentBtn], other});
    setOther(null);
    setCurrentBtn(null);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.closeButton}>
              <Icon name="x" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 20,
            }}
            showsVerticalScrollIndicator={true}>
            <RenderIf condition={loading}>
              <ShimmerSkeleton type={TYPE_SHIMMER_CMS_PAGE} />
            </RenderIf>
            <RenderIf condition={!loading && !reasonList}>
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Failed to load content. Please try again later.
                </Text>
              </View>
            </RenderIf>
            <RenderIf condition={!loading && reasonList}>
              <View style={styles.reasonList}>
                {reasonList.map((item, index) => (
                  <CustomView
                    key={index}
                    row
                    marginTop={14}
                    horizontalCenter
                    onPress={() => setCurrentBtn(index)}>
                    <RadioButton
                      size={18}
                      activeColor={Colors.PRIMARY}
                      selected={index === currentBtn}
                      onPress={() => setCurrentBtn(index)}
                      style={styles.reasonRadioButton}
                    />
                    <Text style={styles.reasonText}>{item.value}</Text>
                  </CustomView>
                ))}
              </View>
              <RenderIf condition={currentBtn === reasonList.length - 1}>
                <InputBox
                  multilines
                  placeholder={t(
                    'account_purchases_detail.view.reasonPlaceHolder',
                  )}
                  style={styles.otherReasonInput}
                  value={other}
                  onChangeText={setOther}
                />
              </RenderIf>
            </RenderIf>
          </ScrollView>
          <CustomView style={styles.footer}>
            <Button
              disabled={disabled}
              width={Mixins.MAX_WIDTH * 0.9}
              borderRadius={8}
              label={t('account_purchases_detail.btn.confirm')}
              styleProp={[
                styles.confirmButton,
                disabled && styles.confirmButtonDisabled,
              ]}
              textStyleProp={[
                styles.confirmButtonText,
                disabled && styles.confirmButtonTextDisabled,
              ]}
              onPress={handleConfirm}
            />
          </CustomView>
        </View>
      </View>
    </Modal>
  );
};

export default ReturnReasonModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxHeight: '50%',
    minHeight: '50%',
    overflow: 'hidden',
  },
  header: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
  },
  reasonList: {
    paddingHorizontal: 14,
  },
  reasonRadioButton: {
    marginRight: 6,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#545453',
  },
  otherReasonInput: {
    height: 'auto',
    minHeight: 44,
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: '#fafafa',
    borderColor: '#f0efed',
    borderWidth: 1.3,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    lineHeight: 20,
    color: '#1b1a19',
  },
  footer: {
    height: 76,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#f0efed',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
    padding: 14,
  },
  confirmButton: {
    height: 48,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#e5e5e5',
  },
  confirmButtonText: {
    color: Colors.WHITE,
    fontWeight: '700',
    fontSize: 16,
  },
  confirmButtonTextDisabled: {
    color: '#969696',
  },
});
