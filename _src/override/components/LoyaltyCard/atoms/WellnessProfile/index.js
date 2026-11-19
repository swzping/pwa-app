import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import Config from 'react-native-config';
import {LocalSvg} from 'react-native-svg/css';
import IconFeather from 'react-native-vector-icons/Feather';

import {useIsFocused} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {fetchWellnessSummary} from '@app/_modules/webviewBeconScreen/api/index';
import Shimmer from '@app/components/_Shimmer';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {navigateTo} from '@app/helpers/Navigation';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {normalize} from '@app/styles/mixins';

const WELLNESS_DOWN_ICON = require('@app/assets/svg/WellnessDownIcon.svg');
const WELLNESS_UP_ICON = require('@app/assets/svg/WellnessUpIcon.svg');

const BECON_PAGE_PATH = '/redirect?market=ID&type=main';

const getDateTime = report => {
  if (!report || !report.analysisDate) {
    return 0;
  }
  const time = new Date(report.analysisDate).getTime();
  return isNaN(time) ? 0 : time;
};

const pickLatestByTypes = (summary, types) => {
  if (!summary) {
    return null;
  }

  let latest = null;
  for (let i = 0; i < types.length; i++) {
    const report = summary[types[i]];
    if (!report) {
      continue;
    }
    if (!latest || getDateTime(report) > getDateTime(latest)) {
      latest = report;
    }
  }
  return latest;
};

const WellnessResultCard = ({
  title,
  score = 0,
  lastTest = '',
  trend = 'up',
  ptsText,
  showTrendIcon = false,
}) => {
  return (
    <View style={styles.testResultItem}>
      <Text style={styles.itemLabel}>{title}</Text>
      <View style={styles.ptsWrapper}>
        <Text style={styles.ptsValue}>{score}</Text>
        <Text style={styles.ptsStr}>{ptsText}</Text>
        <RenderIf condition={showTrendIcon}>
          <LocalSvg
            asset={trend === 'up' ? WELLNESS_UP_ICON : WELLNESS_DOWN_ICON}
          />
        </RenderIf>
      </View>
      <Text style={styles.itemTime}>Last test: {lastTest}</Text>
    </View>
  );
};

const WellnessDefaultCard = ({title}) => {
  return (
    <View style={styles.testResultItem}>
      <Text style={styles.itemLabel}>{title}</Text>
      <View style={styles.itemDefault}>
        <View style={styles.defaultIcon} />
      </View>
    </View>
  );
};

const WellnessProfile = forwardRef((props, ref) => {
  const {isLoggedIn = false, styleCustom = {}, onJump} = props;
  const [isLoading, setIsLoading] = useState(false);
  const {storeConfig} = useStoreConfig({useInitData: true});
  const {t} = useTranslation();
  const isFocused = useIsFocused();

  const [skinData, setSkinData] = useState(null); // 皮肤数据
  const [scalpData, setScalpData] = useState(null); // 头皮数据
  const [errorInfo, setErrorInfo] = useState(null); // 错误信息

  useEffect(() => {
    if (isLoggedIn && isFocused) {
      if (!skinData && !scalpData) {
        onRefresh();
      }
    }
  }, [isFocused, isLoggedIn, storeConfig]);

  const onRefresh = async () => {
    if (!storeConfig?.dfi_becon_customer_enabled) {
      return;
    }
    try {
      setIsLoading(true);
      const result = await fetchWellnessSummary();
      const skinList = pickLatestByTypes(result?.summary, ['SKIN']);
      const scalpList = pickLatestByTypes(result?.summary, ['COMPOSITE_SCALP']);
      setSkinData(skinList);
      setScalpData(scalpList);
    } catch (error) {
      console.log('[Becon-Wellness]-error', error);
      setErrorInfo(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 通过 ref 暴露 refresh 方法
  useImperativeHandle(
    ref,
    () => ({
      refresh: onRefresh,
    }),
    [onRefresh],
  );

  // 统一处理跳转
  const handleJumpPress = () => {
    navigateTo(
      modules.webview_becon_screen.enable,
      modules.webview_becon_screen.name,
      {
        isNavBar: false,
        url: `${Config.BECON_BASE_URL}${BECON_PAGE_PATH}`,
      },
    );

    onJump?.();
  };

  const renderError = () => {
    return (
      <View style={styles.errorCard}>
        <View style={styles.errorIconWrap}>
          <Text style={styles.errorIcon}>!</Text>
        </View>
        <Text style={styles.errorText}>
          {t('account.wellnessProfile.errorText')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.retryButton}
          onPress={onRefresh}>
          <Text style={styles.retryText}>
            {t('account.wellnessProfile.refreshBtn')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const formatDate = iso => {
    if (!iso) {
      return '';
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      return '';
    }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  };

  const transformData = report => {
    if (!report) {
      return {
        score: 0,
        trend: 'up',
        lastTest: '-',
      };
    }

    // compositeScore 有效才四舍五入，无效回退默认0
    const score =
      report.compositeScore != null ? Math.round(report.compositeScore) : 0;

    const rawDiff = report.scoreDiff;
    const hasScoreDiff = rawDiff != null && Number.isFinite(Number(rawDiff));
    const scoreDiff = hasScoreDiff ? Number(rawDiff) : 0;
    const hasPreviousAssessment = report.previousScore != null;
    const showTrendIcon =
      hasPreviousAssessment && hasScoreDiff && scoreDiff !== 0;

    const trend = scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : null;
    const lastTest = report.analysisDate
      ? formatDate(report.analysisDate)
      : '-';

    return {
      score,
      trend,
      lastTest,
      showTrendIcon,
    };
  };

  const renderResultCard = () => {
    const skinFormat = transformData(skinData);
    const scalpFormat = transformData(scalpData);
    if (errorInfo) {
      return renderError();
    }
    if (skinData || scalpData) {
      return (
        <>
          {/* Skin Health  */}
          <RenderIf condition={skinData && isLoggedIn}>
            <WellnessResultCard
              title={t('account.wellnessProfile.skinReport')}
              isLoggedIn={isLoggedIn}
              score={skinFormat.score}
              lastTest={skinFormat.lastTest}
              trend={skinFormat.trend}
              showTrendIcon={skinFormat.showTrendIcon}
              ptsText={t('account.wellnessProfile.pts')}
            />
          </RenderIf>
          {/* Scalp */}
          <RenderIf condition={scalpData && isLoggedIn}>
            <WellnessResultCard
              title={t('account.wellnessProfile.scalpReport')}
              isLoggedIn={isLoggedIn}
              score={scalpFormat.score}
              lastTest={scalpFormat.lastTest}
              trend={scalpFormat.trend}
              showTrendIcon={scalpFormat.showTrendIcon}
              ptsText={t('account.wellnessProfile.pts')}
            />
          </RenderIf>
        </>
      );
    }
    if (!skinData && !scalpData) {
      return (
        <>
          <WellnessDefaultCard
            title={t('account.wellnessProfile.skinReport')}
          />
          <WellnessDefaultCard
            title={t('account.wellnessProfile.scalpReport')}
          />
        </>
      );
    }
    return null;
  };

  return (
    <CustomView style={styleCustom}>
      <RenderIf condition={storeConfig?.dfi_becon_customer_enabled}>
        <TouchableOpacity
          onPress={handleJumpPress}
          style={styles.wellnessProfileContainer}>
          <View style={styles.headerWrapper}>
            <Text style={styles.headerLabel}>
              {t('account.wellnessProfile.title')}
            </Text>
            <IconFeather name="chevron-right" size={24} color="#FF8200" />
          </View>
          <Text style={styles.description}>
            {t('account.wellnessProfile.description')}
          </Text>
          <RenderIf condition={isLoading}>
            <CustomView style={styles.testResultWrapper}>
              <View style={styles.loadingSkeleton}>
                <Shimmer
                  wrapperStyle={{
                    flex: 1,
                    borderRadius: 6,
                    height: normalize(90),
                  }}
                />
                <Shimmer
                  wrapperStyle={{
                    flex: 1,
                    borderRadius: 8,
                    height: normalize(90),
                  }}
                />
              </View>
            </CustomView>
          </RenderIf>
          <RenderIf condition={!isLoading}>
            <View
              style={[
                styles.testResultWrapper,
                {
                  height: errorInfo ? normalize(60) : normalize(90),
                },
              ]}>
              {renderResultCard()}
            </View>
          </RenderIf>
        </TouchableOpacity>
      </RenderIf>
    </CustomView>
  );
});

export default WellnessProfile;

const styles = StyleSheet.create({
  wellnessProfileContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: normalize(12),
    paddingVertical: normalize(18),
    fontFamily: 'Noto Sans',
  },
  loadingSkeleton: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: normalize(6),
    marginTop: normalize(6),
  },
  headerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItem: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: '#212121',
    marginBottom: normalize(4),
  },
  description: {
    color: '#757575',
    fontSize: normalize(12),
    fontWeight: 500,
    marginBottom: normalize(4),
  },
  testResultWrapper: {
    height: normalize(90),
    marginTop: 4,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testResultItem: {
    height: '100%',
    flex: 1,
    backgroundColor: '#FFF8E8',
    padding: 8,
    borderRadius: 8,
    borderWidth: 0.2,
    borderColor: '#FF8200',
  },
  itemLabel: {
    fontSize: normalize(14),
    fontWeight: 700,
    color: '#757575',
  },
  itemTime: {
    color: '#757575',
    fontSize: normalize(10),
    fontWeight: 400,
  },
  itemDefault: {
    marginTop: normalize(8),
    width: 67,
    height: 42,
    justifyContent: 'center',
  },
  defaultIcon: {
    width: normalize(10),
    height: normalize(5),
    backgroundColor: '#212121',
  },
  ptsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: normalize(8),
  },
  ptsValue: {
    fontSize: normalize(28),
    fontWeight: 700,
    color: '#212121',
  },
  ptsStr: {
    fontSize: normalize(14),
    fontWeight: 500,
    marginRight: 4,
  },
  errorCard: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#fff0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIconWrap: {
    width: 25,
    height: 25,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#d63838',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  errorIcon: {
    fontSize: 18,
    lineHeight: 20,
    color: '#d63838',
  },
  errorText: {
    flex: 1,
    fontSize: normalize(12),
    color: '#d63838',
    marginRight: 12,
  },
  retryButton: {
    minWidth: 54,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ff8200',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
