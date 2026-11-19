import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import Config from 'react-native-config';
import LinearGradient from 'react-native-linear-gradient';
import RenderHTML from 'react-native-render-html';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import {fetchWellnessSummary} from '@app/_modules/webviewBeconScreen/api/index';
import {useCmsContext} from '@app/components/Cms/CmsContext';
import RNFImage from '@app/components/Image';
import RenderIf from '@app/components/RenderIf';
import AnalyticsHelper from '@app/helpers/Analytics';
import {navigateTo} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import {rxUserToken} from '@app/services/cache';
import {normalize} from '@app/styles/mixins';

const BECON_PAGE_PATH = '/redirect?market=ID&type=main';

const stripHtml = html => {
  if (!html) {
    return '';
  }
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

const extractTextContent = (item, textType = 'TextWidget') => {
  const children = item?.children;
  if (!children?.length) {
    return '';
  }

  for (const child of children) {
    if (child?.type?.name !== textType) {
      continue;
    }
    const rawText = child.props?.content || child.props?.text;
    const cleanText = rawText ? stripHtml(rawText) : '';
    if (cleanText) {
      return cleanText;
    }
  }
  return '';
};
const pickBeconByType = (summary, types) => {
  if (!summary) {
    return null;
  }
  let latest = null;
  for (let i = 0; i < types.length; i++) {
    const report = summary[types[i]];
    if (!report) {
      continue;
    }
    latest = report;
  }
  return latest;
};
const FeatureCard = ({
  image,
  title,
  desc,
  buttonText,
  onPress,
  imageBgColor = '',
  isNewTag = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardWrapper}
      onPress={onPress}>
      <View style={styles.card}>
        {/* 图片 */}
        <View style={styles.cardImageBox}>
          <RNFImage
            source={image}
            resizeMode="cover"
            style={styles.cardImage}
          />
        </View>

        {/* 标题 */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>

        {/* 描述 */}
        <RenderHTML source={{html: desc}} baseStyle={styles.cardDesc} />
        {/* Button展示 */}
        <View style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </View>
        {/* 角标 */}
        <RenderIf condition={isNewTag}>
          <Text style={styles.newTag}>NEW</Text>
        </RenderIf>
      </View>
    </TouchableOpacity>
  );
};
const FourNLayoutBecon = ({items = [], setEventTrackParamsByClick}) => {
  const {isHomePage} = useCmsContext();

  const userToken = useReactiveVar(rxUserToken);
  const isLoggedIn = userToken !== null;

  const [skinData, setSkinData] = useState(null); // 皮肤数据
  const [scalpData, setScalpData] = useState(null); // 头皮数据
  const [memberId, setMemberId] = useState(null);

  useEffect(() => {
    const loadMemberId = async () => {
      const id = await Storage.get(Storage.name.MEMBER_ID);
      setMemberId(id);
    };

    loadMemberId();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      if (!skinData && !scalpData) {
        getBeconSummary();
      }
    }
  }, [isLoggedIn]);

  const getBeconSummary = async () => {
    try {
      const result = await fetchWellnessSummary();
      const skinList = pickBeconByType(result?.summary, ['SKIN']);
      const scalpList = pickBeconByType(result?.summary, ['COMPOSITE_SCALP']);
      setSkinData(skinList);
      setScalpData(scalpList);
    } catch (error) {
      console.log('[Becon-Wellness]-error', error);
    } finally {
    }
  };

  const getAnalyticsParams = () => ({
    entry_point: isHomePage ? 'homepage' : '',
    loyalty_id: memberId,
    is_logged_in: isLoggedIn,
  });

  const healthCheckHandlePress = index => {
    if (!isLoggedIn) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
        redirectRoute: {
          name: modules.account_health_report.name,
          params: {},
        },
      });
      return;
    }
    navigateTo(
      modules.account_health_report.enable,
      modules.account_health_report.name,
    );

    AnalyticsHelper.eventHealthCheckClick(getAnalyticsParams());
    setEventTrackParamsByClick({index, name: extractTextContent(items[index])});
  };

  const beconHandlePress = index => {
    navigateTo(
      modules.webview_becon_screen.enable,
      modules.webview_becon_screen.name,
      {
        isNavBar: false,
        url: `${Config.BECON_BASE_URL}${BECON_PAGE_PATH}`,
      },
    );

    AnalyticsHelper.eventBeconClick(getAnalyticsParams());
  };
  const beconBtnText = useMemo(() => {
    if (skinData || scalpData) {
      return 'View Result';
    }
    return 'Get Started';
  }, [skinData, scalpData]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFEBD6', '#FFF']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 0.986}}
        style={StyleSheet.absoluteFillObject}
      />
      {/* 标题 */}
      <Text style={styles.header}>{extractTextContent(items[0])}</Text>

      <View style={styles.rowWrapper}>
        <FeatureCard
          image={items[1]?.mobileImage || items[1]?.desktopImage}
          title={extractTextContent(items[1], 'HeadingWidget')}
          desc={extractTextContent(items[1])}
          buttonText="View"
          onPress={() => healthCheckHandlePress()}
        />

        <FeatureCard
          image={items[2]?.mobileImage || items[2]?.desktopImage}
          title={extractTextContent(items[2], 'HeadingWidget')}
          desc={extractTextContent(items[2])}
          buttonText={beconBtnText}
          isNewTag={beconBtnText === 'Get Started' ? true : false}
          onPress={() => beconHandlePress()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 16,
  },

  header: {
    fontSize: 16,
    fontWeight: 700,
    color: '#ff8200',
    marginBottom: 12,
  },

  rowWrapper: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },

  cardWrapper: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
    // iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.06,
    shadowRadius: 5,
    // Android
    elevation: 2,
  },

  card: {
    flex: 1,
    position: 'relative',
    padding: normalize(12),
  },

  cardImageBox: {
    height: normalize(132),
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: normalize(8),
    overflow: 'hidden',
  },

  cardImage: {
    width: '100%',
    height: normalize(132),
    borderRadius: normalize(8),
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#212121',
    marginTop: 8,
    marginBottom: 8,
  },

  cardDesc: {
    fontSize: 13,
    fontWeight: 400,
    color: '#757575',
    marginBottom: 16,
  },

  button: {
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ff8200',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },

  buttonText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
  },
  newTag: {
    position: 'absolute',
    right: normalize(12),
    top: normalize(12),
    width: 29,
    height: 16,
    lineHeight: 16,
    borderRadius: 4,
    backgroundColor: '#ECFAEC',
    textAlign: 'center',
    color: '#46A147',
    fontSize: 10,
    fontWeight: 500,
  },
});

export default FourNLayoutBecon;
