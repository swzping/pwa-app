import React, {useState} from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';
import ImageView from 'react-native-image-viewing';
import Svg, {Rect} from 'react-native-svg';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';

import RenderIf from '@app/components/RenderIf';

const BYTES_PER_MB = 1024 * 1024;

/**
 * ---------------------------------------------------- *
 * @function sortVideoFirst
 * @summary 稳定排序：视频在前、图片在后（同类保持原有相对顺序）。
 *          添加合并与展示（含只读态 attachments）统一按 视频 > 图片
 * ---------------------------------------------------- *
 */
const sortVideoFirst = (list, isVideo) =>
  [...(list || [])].sort((a, b) => Number(isVideo(b)) - Number(isVideo(a)));

/* 虚线上传框（视频 / 图片两个入口）的边框样式 */
const DASH_BORDER_COLOR = '#c4c4c4';
const DASH_BORDER_WIDTH = 1.5;
const DASH_PATTERN = '6 4';

/**
 * ---------------------------------------------------- *
 * @component DashedBorder
 * @summary 上传入口的虚线边框（SVG 实现，iOS/Android 表现一致）
 * ---------------------------------------------------- *
 */
const DashedBorder = ({size, borderRadius}) => (
  <Svg width={size} height={size} style={styles.uploadBoxBorder}>
    <Rect
      x={DASH_BORDER_WIDTH / 2}
      y={DASH_BORDER_WIDTH / 2}
      width={size - DASH_BORDER_WIDTH}
      height={size - DASH_BORDER_WIDTH}
      rx={Math.max(borderRadius - DASH_BORDER_WIDTH / 2, 0)}
      fill="none"
      stroke={DASH_BORDER_COLOR}
      strokeWidth={DASH_BORDER_WIDTH}
      strokeDasharray={DASH_PATTERN}
    />
  </Svg>
);

/**
 * ---------------------------------------------------- *
 * @component MediaUploader
 * @summary 退货凭证选择/上传预览网格（图片 + 视频）
 *
 * @notes
 * - 编辑态：视频 / 图片各有一个虚线上传入口，分别打开对应
 *   类型选择器；onMediaChange 同步给父组件，由父组件在提交时
 *   统一走 REST 上传换取 token
 * - 只读态（readonly）：展示服务端 attachments（url 为签名链接，
 *   30 分钟过期，展示前必须重新查询）
 * - 预览：点击缩略图全屏查看（disablePreview 可关闭）—— 图片走
 *   react-native-image-viewing（左右滑动切换 / 双击缩放 / 下滑关闭），
 *   视频走全屏 Modal + 原生控制条播放
 * - 排序：视频 > 图片 —— 新增合并（onMediaChange 回传列表）、
 *   网格展示（含只读态 attachments）、预览列表统一按此规则
 * - 校验参数来自 dfiReturnOptions.media（§1），不写死：
 *   数量限制 = 总数 maxFiles + 分类 maxVideoFiles / maxImageFiles
 * ---------------------------------------------------- *
 */
const MediaUploader = ({
  style,
  maxFiles = 3,
  maxVideoFiles = maxFiles,
  maxImageFiles = maxFiles,
  minFiles = 0,
  videoRequired = false,
  maxVideoMb = 20,
  maxImageMb = 5,
  videoExtensions = ['mp4', 'mov', 'webm'],
  imageExtensions = ['jpg', 'jpeg', 'png', 'heic'],
  readonly = false,
  sources = [],
  disablePreview = false,
  size = 64,
  borderRadius = 8,
  onMediaChange,
}) => {
  const [mediaList, setMediaList] = useState([]);
  // 预览状态：图片大图查看器的索引（null = 关闭）/ 视频播放的 URI（null = 关闭）
  const [previewImageIndex, setPreviewImageIndex] = useState(null);
  const [previewVideoUri, setPreviewVideoUri] = useState(null);

  // 分类计数（分别受 maxVideoFiles / maxImageFiles 限制）
  const videoCount = mediaList.filter(
    item => item.pickedType === 'video',
  ).length;
  const imageCount = mediaList.filter(
    item => item.pickedType === 'image',
  ).length;

  /**
   * ---------------------------------------------------- *
   * @function getExtension
   * @summary 优先取文件名扩展名，取不到再从 mime 推断
   * ---------------------------------------------------- *
   */
  const getExtension = item => {
    const name = String(item.filename || item.path || '');
    const dot = name.lastIndexOf('.');
    if (dot >= 0) {
      return name.slice(dot + 1).toLowerCase();
    }
    const mime = String(item.mime || '');
    const slash = mime.lastIndexOf('/');
    return slash >= 0 ? mime.slice(slash + 1).toLowerCase() : '';
  };

  /**
   * ---------------------------------------------------- *
   * @function validateSelection
   * @summary 按 dfiReturnOptions.media 规则校验选中的文件
   *          （扩展名 / 大小 / 数量），返回通过校验的文件
   * ---------------------------------------------------- *
   */
  const validateSelection = selected => {
    const allowedExts = [...videoExtensions, ...imageExtensions];
    const accepted = [];
    let rejectedType = false;
    let rejectedSize = false;
    let rejectedTotalCount = false;
    let rejectedVideoCount = false;
    let rejectedImageCount = false;
    let videosAdded = 0;
    let imagesAdded = 0;

    for (const item of selected) {
      if (mediaList.length + accepted.length >= maxFiles) {
        rejectedTotalCount = true;
        break;
      }
      const ext = getExtension(item);
      const isVideo = videoExtensions.includes(ext);
      const isImage = imageExtensions.includes(ext);
      if (!isVideo && !isImage) {
        rejectedType = true;
        continue;
      }
      if (isVideo) {
        if (videoCount + videosAdded >= maxVideoFiles) {
          rejectedVideoCount = true;
          continue;
        }
      } else if (imageCount + imagesAdded >= maxImageFiles) {
        rejectedImageCount = true;
        continue;
      }
      const limitMb = isVideo ? maxVideoMb : maxImageMb;
      const sizeMb = (Number(item.size) || 0) / BYTES_PER_MB;
      if (sizeMb > limitMb) {
        rejectedSize = true;
        continue;
      }
      accepted.push({
        ...item,
        pickedType: isVideo ? 'video' : 'image',
      });
      if (isVideo) {
        videosAdded += 1;
      } else {
        imagesAdded += 1;
      }
    }

    if (rejectedType) {
      Alert.alert(
        'Notice',
        'This file type is not allowed. Allowed types: ' +
          allowedExts.join(', ') +
          '.',
      );
    }
    if (rejectedSize) {
      Alert.alert(
        'Notice',
        `The file is too large. The maximum size is ${Math.max(
          maxVideoMb,
          maxImageMb,
        )} MB.`,
      );
    }
    if (rejectedVideoCount) {
      Alert.alert('Notice', `You can attach up to ${maxVideoFiles} videos.`);
    }
    if (rejectedImageCount) {
      Alert.alert('Notice', `You can attach up to ${maxImageFiles} photos.`);
    }
    if (rejectedTotalCount) {
      Alert.alert('Notice', `You can attach at most ${maxFiles} files.`);
    }
    return accepted;
  };

  // Trigger selector（按类型：video 仅视频，image 仅图片）
  const handlePick = type => {
    const isVideo = type === 'video';
    if (mediaList.length >= maxFiles) {
      Alert.alert('Notice', `You can attach at most ${maxFiles} files.`);
      return;
    }
    if (isVideo && videoCount >= maxVideoFiles) {
      Alert.alert('Notice', `You can attach up to ${maxVideoFiles} videos.`);
      return;
    }
    if (!isVideo && imageCount >= maxImageFiles) {
      Alert.alert('Notice', `You can attach up to ${maxImageFiles} photos.`);
      return;
    }

    ImagePicker.openPicker({
      multiple: true,
      mediaType: isVideo ? 'video' : 'photo', // 按入口类型过滤
      includeBase64: false,
      cropping: false, // Crop is usually disabled when selecting multiple items
    })
      .then(selected => {
        const accepted = validateSelection(selected || []);
        if (accepted.length === 0) {
          return;
        }
        const updatedList = sortVideoFirst(
          [...mediaList, ...accepted].slice(0, maxFiles),
          item => item.pickedType === 'video',
        );
        setMediaList(updatedList);
        onMediaChange?.(updatedList);
      })
      .catch(e => {
        if (e.code !== 'E_PICKER_CANCELLED') {
          console.log(e);
        }
      });
  };

  // Remove media
  const handleRemove = index => {
    const updated = mediaList.filter((_, i) => i !== index);
    setMediaList(updated);
    onMediaChange?.(updated);
  };

  /* ---------- 全屏预览（点击缩略图触发） ---------- */

  // 只读态取服务端 attachments（签名 URL），编辑态取本地已选文件；
  // 展示/预览统一按 视频 > 图片 排序（同类保持原有相对顺序）
  const getPreviewUri = item => String((readonly ? item.url : item.path) || '');
  const isVideoItem = item =>
    readonly
      ? String(item.type || '').toUpperCase() === 'VIDEO'
      : item.pickedType === 'video';
  const orderedList = sortVideoFirst(
    readonly ? sources || [] : mediaList,
    isVideoItem,
  );
  // ImageView 只接收图片；视频走独立的播放 Modal
  const previewImages = disablePreview
    ? []
    : orderedList
        .filter(item => !isVideoItem(item))
        .map(item => ({uri: getPreviewUri(item)}));

  /**
   * ---------------------------------------------------- *
   * @function handlePreview
   * @summary 点击缩略图：视频打开播放 Modal，图片打开大图查看器
   * ---------------------------------------------------- *
   */
  const handlePreview = item => {
    if (disablePreview) {
      return;
    }
    const uri = getPreviewUri(item);
    if (!uri) {
      return;
    }
    if (isVideoItem(item)) {
      setPreviewVideoUri(uri);
      return;
    }
    const imageIndex = previewImages.findIndex(img => img.uri === uri);
    if (imageIndex >= 0) {
      setPreviewImageIndex(imageIndex);
    }
  };

  // 视频预览加载失败（如签名 URL 已过期）：提示并关闭预览
  const handleVideoPreviewError = e => {
    console.log(e);
    Alert.alert('Notice', 'Failed to load the video.');
    setPreviewVideoUri(null);
  };

  return (
    <View style={[styles.grid, style]}>
      {/* 只读态：展示服务端 attachments（签名 URL） */}
      <RenderIf condition={readonly}>
        {orderedList.map((item, index) => {
          const isVideo = isVideoItem(item);
          return (
            <View
              key={`attachment-${index}`}
              style={[
                styles.mediaBox,
                {width: size, height: size, borderRadius},
              ]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePreview(item)}
                style={styles.mediaTouch}>
                {isVideo ? (
                  <Video
                    source={{uri: item.url}}
                    style={styles.media}
                    resizeMode="cover"
                    paused
                  />
                ) : (
                  <Image
                    source={{uri: item.url}}
                    style={styles.media}
                    resizeMode="cover"
                  />
                )}
                {isVideo && (
                  <View style={styles.playBadge}>
                    <View style={styles.playBadgeIcon}>
                      <FeatherIcon name="play" size={12} color="#fff" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
        <RenderIf condition={!(sources || []).length}>
          <Text style={styles.emptyText}>No attachment</Text>
        </RenderIf>
      </RenderIf>

      {/* 编辑态：已选文件预览 */}
      <RenderIf condition={!readonly}>
        {mediaList.map((item, index) => {
          const isVideo = isVideoItem(item);
          return (
            <View
              key={`${item.path}-${index}`}
              style={[
                styles.mediaBox,
                {width: size, height: size, borderRadius},
              ]}>
              {/* 点缩略图全屏预览；× 删除按钮独立在上层，互不影响 */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePreview(item)}
                style={styles.mediaTouch}>
                {isVideo ? (
                  <Video
                    source={{uri: item.path}}
                    style={styles.media}
                    resizeMode="cover"
                    paused
                  />
                ) : (
                  <Image
                    source={{uri: item.path}}
                    style={styles.media}
                    resizeMode="cover"
                  />
                )}
                {isVideo && (
                  <View style={styles.playBadge}>
                    <View style={styles.playBadgeIcon}>
                      <FeatherIcon name="play" size={12} color="#fff" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemove(index)}
                style={styles.removeBtn}>
                <FeatherIcon name="x" size={10} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* 类型专属上传入口：视频 / 图片（各自上限或总数未满时展示） */}
        <RenderIf
          condition={mediaList.length < maxFiles && videoCount < maxVideoFiles}>
          <TouchableOpacity
            onPress={() => handlePick('video')}
            style={[
              styles.uploadBox,
              {width: size, height: size, borderRadius},
            ]}>
            <DashedBorder size={size} borderRadius={borderRadius} />
            <FeatherIcon name="video" size={24} color="#9e9e9e" />
          </TouchableOpacity>
        </RenderIf>
        <RenderIf
          condition={mediaList.length < maxFiles && imageCount < maxImageFiles}>
          <TouchableOpacity
            onPress={() => handlePick('image')}
            style={[
              styles.uploadBox,
              {width: size, height: size, borderRadius},
            ]}>
            <DashedBorder size={size} borderRadius={borderRadius} />
            <FeatherIcon name="image" size={24} color="#9e9e9e" />
          </TouchableOpacity>
        </RenderIf>
      </RenderIf>

      {/* 全屏预览：图片大图查看器（左右滑动切换 / 双击缩放 / 下滑关闭） */}
      <RenderIf condition={previewImages.length > 0}>
        <ImageView
          images={previewImages}
          imageIndex={previewImageIndex ?? 0}
          visible={previewImageIndex !== null}
          onRequestClose={() => setPreviewImageIndex(null)}
          backgroundColor="#000000"
        />
      </RenderIf>

      {/* 全屏预览：视频播放（原生控制条；关闭按钮 / Android 返回键退出） */}
      <Modal
        visible={previewVideoUri !== null}
        animationType="fade"
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={() => setPreviewVideoUri(null)}>
        <View style={styles.previewModal}>
          <Video
            source={{uri: previewVideoUri || ''}}
            style={styles.previewVideo}
            resizeMode="contain"
            controls
            paused={false}
            onError={handleVideoPreviewError}
          />
          <TouchableOpacity
            style={styles.previewCloseBtn}
            activeOpacity={0.8}
            onPress={() => setPreviewVideoUri(null)}>
            <FeatherIcon name="x" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

/**
 * ---------------------------------------------------- *
 * @function validateMediaList
 * @summary 提交前的整体校验：文件数量与「至少一个视频」规则，
 *          返回错误文案（null 表示通过）。供表单提交时调用。
 * ---------------------------------------------------- *
 */
export const validateMediaList = (list, mediaConfig = {}) => {
  const {
    enabled = true,
    min_files: minFiles = 0,
    video_required: videoRequired = false,
  } = mediaConfig;

  if (!enabled) {
    return null;
  }
  const count = (list || []).length;
  if (count < Math.max(minFiles, 1)) {
    return 'Please attach at least one file.';
  }
  if (videoRequired && !list.some(item => item.pickedType === 'video')) {
    return 'Please attach at least one video.';
  }
  return null;
};

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  uploadBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  uploadBoxBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mediaBox: {
    marginRight: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  media: {width: '100%', height: '100%'},
  mediaTouch: {width: '100%', height: '100%'},
  playBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBadgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    borderRadius: 10,
    padding: 2,
  },
  previewModal: {flex: 1, backgroundColor: '#000'},
  previewVideo: {width: '100%', height: '100%'},
  previewCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#9e9e9e',
    alignSelf: 'center',
  },
});

export default MediaUploader;
