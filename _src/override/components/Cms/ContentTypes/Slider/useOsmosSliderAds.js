import React, {useEffect, useMemo, useState} from 'react';
import {useReactiveVar} from '@apollo/client';
import {adFetcher, tracker} from '@onlinesales-ai/osmos-react-native-sdk';

import {getCliUbid, normalizeOsmosClick} from '@app/helpers/Osmos';
import {rxUserInformation} from '@app/services/cache';

const OSMOS_PAGE_TYPE = 'GUIDAppHomePage';
const OSMOS_CUSTOM_LABEL_1 = 'GUID';
const OSMOS_AD_UNIT_MAP = {
  'osmos-banner': ['GUIDAppHomePageSliderBanner'],
  'osmos-topPicks': ['GUIDAppHomePageTPBanner'],
  'osmos-brand-banner': ['GUIDAppHomePageBrandBanner'],
};

const HOME_PREFETCH_AD_UNITS = [
  'GUIDAppHomePageSliderBanner',
  'GUIDAppHomePageBrandBanner',
];

const createAdPool = () => ({
  sharedFetchPromise: null,
  sharedAdsList: [],
  nextConsumeIndex: 0,
  registeredUclids: new Set(),
});
const adPools = new Map();

const getAdPool = poolKey => {
  if (!adPools.has(poolKey)) {
    adPools.set(poolKey, createAdPool());
  }
  return adPools.get(poolKey);
};

const buildPoolKey = (needOnlineAds, cliUbid) =>
  `${needOnlineAds.join('|')}|${cliUbid}`;

const isPlaceholderChild = child => {
  if (!React.isValidElement(child)) {
    return false;
  }

  const props = child.props || {};
  const hasBannerImageProps =
    'desktop_image' in props || 'mobile_image' in props;
  const hasImageWidgetProps = 'desktopImage' in props || 'mobileImage' in props;

  if (!hasBannerImageProps && !hasImageWidgetProps) {
    return false;
  }

  const bannerImage = props.mobile_image || props.desktop_image;
  const imageWidgetImage = props.mobileImage || props.desktopImage;

  return !bannerImage && !imageWidgetImage;
};

const injectAdIntoChild = (child, ad) => {
  if (!React.isValidElement(child) || !ad?.image) {
    return child;
  }

  const props = child.props || {};
  const nextProps = {isOsmosPlaceholder: false};

  if ('desktop_image' in props || 'mobile_image' in props) {
    nextProps.desktop_image = ad.image;
    nextProps.mobile_image = ad.image;
    nextProps.link = ad.link || props.link;
    nextProps.clickType = ad.clickType;
    nextProps.clickValue = ad.clickValue;
    nextProps.uclid = ad.uclid || props.uclid;
    nextProps.isOsmosAd = true;
  }

  if ('desktopImage' in props || 'mobileImage' in props) {
    nextProps.desktopImage = ad.image;
    nextProps.mobileImage = ad.image;
    nextProps.link = ad.link || props.link;
    nextProps.clickType = ad.clickType;
    nextProps.clickValue = ad.clickValue;
    nextProps.uclid = ad.uclid || props.uclid;
    nextProps.isOsmosAd = true;
  }

  return React.cloneElement(child, nextProps);
};

const normalizeAdItem = item => {
  const elements = item?.elements || {};
  const click = normalizeOsmosClick(elements, item);

  return {
    image:
      elements?.imageId ||
      elements?.image ||
      item?.image ||
      '',
    link: click.link,
    clickType: click.clickType,
    clickValue: click.clickValue,
    uclid: item?.uclid || '',
  };
};

const getRawAdsByUnit = (result, adUnit) => {
  if (Array.isArray(result)) {
    return result;
  }

  const directAds = result?.ads?.[adUnit];
  if (Array.isArray(directAds)) {
    return directAds;
  }

  if (result?.ads) {
    const firstAdsArray = Object.values(result.ads).find(value =>
      Array.isArray(value),
    );
    if (Array.isArray(firstAdsArray)) {
      return firstAdsArray;
    }
  }

  return [];
};

const populatePoolFromResult = (pool, result, needOnlineAds) => {
  if (pool.sharedAdsList.length > 0) {
    return;
  }

  needOnlineAds.forEach(adUnit => {
    getRawAdsByUnit(result, adUnit).forEach(item => {
      const normalizedAd = normalizeAdItem(item);
      if (normalizedAd.image) {
        pool.sharedAdsList.push(normalizedAd);
      }
    });
  });
};

const registerImpressions = (rawItems, pool, cliUbid) => {
  rawItems.forEach(item => {
    if (!item?.uclid || pool.registeredUclids.has(item.uclid)) {
      return;
    }

    pool.registeredUclids.add(item.uclid);
    tracker
      .registerAdImpressionEvent({
        cliUbid,
        customLabel1: OSMOS_CUSTOM_LABEL_1,
        uclid: item.uclid,
      })
      .catch(() => {});
  });
};

const registerImpressionsForResult = (pool, result, needOnlineAds, cliUbid) => {
  needOnlineAds.forEach(adUnit => {
    registerImpressions(getRawAdsByUnit(result, adUnit), pool, cliUbid);
  });
};

const consumeAdsFromPool = (pool, placeholderCount) => {
  if (
    pool.sharedAdsList.length > 0 &&
    pool.nextConsumeIndex >= pool.sharedAdsList.length
  ) {
    pool.nextConsumeIndex = 0;
  }

  const startIndex = pool.nextConsumeIndex;
  const consumedAds = pool.sharedAdsList.slice(
    startIndex,
    startIndex + placeholderCount,
  );
  pool.nextConsumeIndex += consumedAds.length;
  return consumedAds;
};

const ensurePoolFetch = ({pool, cliUbid, needOnlineAds}) => {
  if (!pool.sharedFetchPromise) {
    pool.sharedFetchPromise = adFetcher
      .fetchDisplayAdsWithAu({
        cliUbid,
        pageType: OSMOS_PAGE_TYPE,
        adUnit: needOnlineAds.length === 1 ? needOnlineAds[0] : needOnlineAds,
        customLabel1: OSMOS_CUSTOM_LABEL_1,
        productCount: 10,
      })
      .then(result => {
        populatePoolFromResult(pool, result, needOnlineAds);
        registerImpressionsForResult(pool, result, needOnlineAds, cliUbid);
        return result;
      })
      .catch(error => {
        pool.sharedFetchPromise = null;
        pool.sharedAdsList = [];
        pool.nextConsumeIndex = 0;
        pool.registeredUclids.clear();
        throw error;
      });
  }

  return pool.sharedFetchPromise;
};

export const prefetchOsmosHomeSliderAds = async () => {
  const cliUbid = await getCliUbid();

  HOME_PREFETCH_AD_UNITS.forEach(adUnit => {
    const needOnlineAds = [adUnit];
    const poolKey = buildPoolKey(needOnlineAds, cliUbid);
    const pool = getAdPool(poolKey);
    ensurePoolFetch({pool, cliUbid, needOnlineAds});
  });
};

export const useOsmosSliderAds = ({children, cssClasses = []}) => {
  const userInformation = useReactiveVar(rxUserInformation);
  const [ads, setAds] = useState([]);
  const [adsLoaded, setAdsLoaded] = useState(true);

  const originalChildren = useMemo(
    () => React.Children.toArray(children),
    [children],
  );

  const cssClassKey = Array.isArray(cssClasses) ? cssClasses.join('|') : '';
  const matchedKey = useMemo(
    () => cssClasses.find(key => OSMOS_AD_UNIT_MAP[key]),
    [cssClassKey],
  );
  const needOnlineAds = useMemo(
    () => (matchedKey ? OSMOS_AD_UNIT_MAP[matchedKey] : null),
    [matchedKey],
  );
  const placeholderCount = useMemo(
    () => originalChildren.filter(isPlaceholderChild).length,
    [originalChildren],
  );

  const [cliUbid, setCliUbid] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const resolveCliUbid = async () => {
      const nextCliUbid = await getCliUbid(userInformation);
      if (!isCancelled) {
        setCliUbid(nextCliUbid);
      }
    };

    resolveCliUbid();

    return () => {
      isCancelled = true;
    };
  }, [userInformation]);

  const poolKey = useMemo(() => {
    if (!needOnlineAds || !cliUbid) {
      return null;
    }

    return buildPoolKey(needOnlineAds, cliUbid);
  }, [cliUbid, needOnlineAds]);

  const useSequentialConsume = useMemo(
    () =>
      (matchedKey === 'osmos-banner' ||
        matchedKey === 'osmos-topPicks' ||
        matchedKey === 'osmos-brand-banner') &&
      placeholderCount > 0,
    [matchedKey, placeholderCount],
  );

  useEffect(() => {
    let isCancelled = false;
    let consumedCount = 0;
    let activePool = null;

    if (!needOnlineAds || placeholderCount === 0) {
      setAds([]);
      setAdsLoaded(true);
      return () => {
        isCancelled = true;
      };
    }

    if (!cliUbid || !poolKey) {
      setAds([]);
      setAdsLoaded(false);
      return () => {
        isCancelled = true;
      };
    }

    const pool = getAdPool(poolKey);
    activePool = pool;

    const applyAds = resolvedAds => {
      if (!isCancelled) {
        setAds(resolvedAds || []);
        setAdsLoaded(true);
      }
    };

    if (useSequentialConsume && pool.sharedAdsList.length > 0) {
      const cachedAds = consumeAdsFromPool(pool, placeholderCount);
      if (cachedAds.length > 0) {
        consumedCount = cachedAds.length;
        applyAds(cachedAds);
        return () => {
          isCancelled = true;
          activePool.nextConsumeIndex = Math.max(
            0,
            activePool.nextConsumeIndex - consumedCount,
          );
        };
      }
    }

    setAds([]);
    setAdsLoaded(false);

    const fetchAds = async () => {
      try {
        await ensurePoolFetch({
          pool,
          cliUbid,
          needOnlineAds,
        });

        if (isCancelled) {
          return;
        }

        const resolvedAds = useSequentialConsume
          ? consumeAdsFromPool(pool, placeholderCount)
          : pool.sharedAdsList;

        consumedCount = useSequentialConsume ? resolvedAds?.length || 0 : 0;
        applyAds(resolvedAds);
      } catch (error) {
        if (__DEV__) {
          console.log('[Osmos] fetch error', error);
        }

        if (!isCancelled) {
          setAds([]);
          setAdsLoaded(true);
        }
      }
    };

    fetchAds();

    return () => {
      isCancelled = true;
      if (activePool && consumedCount > 0 && useSequentialConsume) {
        activePool.nextConsumeIndex = Math.max(
          0,
          activePool.nextConsumeIndex - consumedCount,
        );
      }
    };
  }, [
    cliUbid,
    needOnlineAds,
    placeholderCount,
    poolKey,
    useSequentialConsume,
  ]);

  const resolvedChildren = useMemo(() => {
    if (!needOnlineAds) {
      return originalChildren;
    }

    if (!adsLoaded) {
      return originalChildren.map(child => {
        if (!isPlaceholderChild(child)) {
          return child;
        }

        return React.cloneElement(child, {isOsmosPlaceholder: true});
      });
    }

    if (!ads.length) {
      return originalChildren.filter(child => !isPlaceholderChild(child));
    }

    const placeholderIndexes = originalChildren
      .map((child, index) => (isPlaceholderChild(child) ? index : -1))
      .filter(index => index !== -1);

    const replacedChildren = [...originalChildren];

    placeholderIndexes.forEach((childIndex, index) => {
      if (ads[index]) {
        replacedChildren[childIndex] = injectAdIntoChild(
          originalChildren[childIndex],
          ads[index],
        );
      }
    });

    return replacedChildren.filter(child => !isPlaceholderChild(child));
  }, [ads, adsLoaded, needOnlineAds, originalChildren]);

  return {
    adsLoaded,
    resolvedChildren,
  };
};
