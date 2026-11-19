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
import RenderHTML from '@app/components/RenderHTML';
import RenderIf from '@app/components/RenderIf';
import {TYPE_SHIMMER_CMS_PAGE} from '@app/helpers/Constants';

const PointsInfoModal = ({
  modalVisible,
  cmsPageTitle,
  cmsPageLoading,
  cmsPageError,
  cmsPageContent,
  setModalVisible,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.pointsModalOverlay}>
        <View style={styles.pointsModalContent}>
          {/* Header */}
          <View style={styles.pointsModalHeader}>
            <Text style={styles.pointsModalTitle}>{cmsPageTitle}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.pointsModalCloseButton}>
              <Icon name="x" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.pointsModalScrollView}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: insets.bottom + 20,
            }}
            showsVerticalScrollIndicator={true}>
            <RenderIf condition={cmsPageLoading}>
              <ShimmerSkeleton type={TYPE_SHIMMER_CMS_PAGE} />
            </RenderIf>
            <RenderIf condition={!cmsPageLoading && cmsPageError}>
              <View style={{padding: 20, alignItems: 'center'}}>
                <Text style={{fontSize: 14, color: '#FF0000'}}>
                  Failed to load content. Please try again later.
                </Text>
              </View>
            </RenderIf>
            <RenderIf
              condition={!cmsPageLoading && !cmsPageError && cmsPageContent}>
              <RenderHTML
                htmlBlock={cmsPageContent}
                tagsStyles={{
                  div: {
                    marginBottom: 8,
                  },
                  p: {
                    margin: 0,
                    padding: 0,
                    marginBottom: 8,
                  },
                  ul: {
                    margin: 0,
                    padding: 0,
                    paddingLeft: 20,
                  },
                  li: {
                    margin: 0,
                    padding: 0,
                    marginBottom: 4,
                  },
                  br: {
                    margin: 10,
                  },
                  span: {
                    margin: 0,
                    padding: 0,
                  },
                }}
                baseStyle={{
                  fontSize: 14,
                  color: '#333333',
                }}
              />
            </RenderIf>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  pointsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pointsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '70%',
    minHeight: '70%',
    overflow: 'hidden',
  },
  pointsModalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    position: 'relative',
  },
  pointsModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  pointsModalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  pointsModalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsModalScrollView: {
    flex: 1,
  },
  pointsModalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  pointsModalLastSection: {
    borderBottomWidth: 0,
  },
  pointsModalSectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  pointsModalHighlightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8200',
    marginBottom: 12,
  },
  pointsModalList: {
    paddingLeft: 8,
  },
  pointsModalListItem: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 8,
  },
});

export default PointsInfoModal;
