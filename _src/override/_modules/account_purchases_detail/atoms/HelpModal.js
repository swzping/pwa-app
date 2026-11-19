import React from 'react';
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
import RenderIf from '@app/components/RenderIf';
import {TYPE_SHIMMER_CMS_PAGE} from '@app/helpers/Constants';

const HelpModal = ({visible, loading, title, data, onClose}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.helpModalOverlay}>
        <View style={styles.helpModalContent}>
          {/* Header */}
          <View style={styles.helpModalHeader}>
            <RenderIf condition={title}>
              <Text style={styles.helpModalTitle}>{title}</Text>
            </RenderIf>
            <TouchableOpacity
              onPress={onClose}
              style={styles.helpModalCloseButton}>
              <Icon name="x" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.helpModalScrollView}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 20,
            }}
            showsVerticalScrollIndicator={true}>
            <RenderIf condition={loading}>
              <ShimmerSkeleton type={TYPE_SHIMMER_CMS_PAGE} />
            </RenderIf>
            <RenderIf condition={!loading && !data}>
              <View style={{padding: 20, alignItems: 'center'}}>
                <Text style={{fontSize: 14, color: '#FF0000'}}>
                  Failed to load content. Please try again later.
                </Text>
              </View>
            </RenderIf>
            <RenderIf condition={!loading && data}>
              <View style={{paddingHorizontal: 14}}>
                <Text>{data}</Text>
              </View>
            </RenderIf>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default HelpModal;

const styles = StyleSheet.create({
  helpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  helpModalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '70%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  helpModalHeader: {
    padding: 14,
    position: 'relative',
    height: 24,
  },
  helpModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  helpModalCloseButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpModalScrollView: {
    flex: 1,
  },
});
