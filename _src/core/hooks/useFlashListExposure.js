import {useCallback, useEffect, useRef} from 'react';

/**
 * FlashList first exposure hook
 * @param {Object} options config options
 * @param {number} options.visibleThreshold exposure threshold (0-1), default is 0.5
 * @param {number} options.minVisibleTime minimum visible time (ms), default is 1000
 * @param {boolean} options.enableLog whether to enable logging
 * @returns {Object} exposure data and methods
 */
export const useFlashListExposure = (options = {}) => {
  const {visibleThreshold = 0.5, minVisibleTime = 1000} = options;

  // record of exposed items
  const exposedItemsRef = useRef(new Set());
  const visibleItemsRef = useRef([]);
  const exposureTimersRef = useRef(new Map());
  const mountedRef = useRef(true);

  // keep latest options in a ref so callbacks stay referentially stable
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // record logs
  const log = useCallback(
    (...args) => {
      if (optionsRef.current.enableLog && mountedRef.current) {
        console.log('[FlashListExposure]', ...args);
      }
    },
    [],
  );

  /**
   * Check if an item is visible in the viewport
   */
  const isItemVisible = useCallback(
    (itemLayout, listLayout) => {
      if (!itemLayout || !listLayout) {
        return false;
      }

      const {
        x: itemX,
        y: itemY,
        width: itemWidth,
        height: itemHeight,
      } = itemLayout;
      const {
        x: listX,
        y: listY,
        width: listWidth,
        height: listHeight,
      } = listLayout;

      // calculate intersection area
      const intersectionX = Math.max(itemX, listX);
      const intersectionY = Math.max(itemY, listY);
      const intersectionWidth =
        Math.min(itemX + itemWidth, listX + listWidth) - intersectionX;
      const intersectionHeight =
        Math.min(itemY + itemHeight, listY + listHeight) - intersectionY;

      if (intersectionWidth <= 0 || intersectionHeight <= 0) {
        return false;
      }

      // calculate visible ratio
      const itemArea = itemWidth * itemHeight;
      const visibleArea = intersectionWidth * intersectionHeight;
      const visibleRatio = visibleArea / itemArea;

      return visibleRatio >= visibleThreshold;
    },
    [visibleThreshold],
  );

  /**
   * Start first exposure timer
   */
  const startFirstExposureTimer = useCallback(
    (itemId, index, extraData = {}) => {
      if (exposedItemsRef.current.has(itemId)) {
        return;
      }

      // clear existing timer if any
      stopExposureTimer(itemId);

      const timer = setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        // update exposed items record
        exposedItemsRef.current.add(itemId);

        if (extraData.onExposure) {
          extraData.onExposure({
            id: itemId,
            index,
            exposedAt: Date.now(),
            ...extraData,
          });
        }

        log(`Item ${itemId} exposed`);
        exposureTimersRef.current.delete(itemId);
      }, minVisibleTime);

      exposureTimersRef.current.set(itemId, timer);
    },
    [minVisibleTime, log],
  );

  /**
   * Stop exposure timer
   */
  const stopExposureTimer = useCallback(itemId => {
    const timer = exposureTimersRef.current.get(itemId);
    if (timer) {
      clearTimeout(timer);
      exposureTimersRef.current.delete(itemId);
    }
  }, []);

  /**
   * Handle viewable items changed - core method
   */
  const handleViewableItemsChanged = useCallback(
    ({viewableItems}) => {
      if (!mountedRef.current || !viewableItems) {
        return;
      }

      const now = Date.now();
      const newVisible = [];
      const previousVisible = new Set(visibleItemsRef.current.map(v => v.id));

      // process viewable items
      viewableItems.forEach(item => {
        if (!item.isViewable) {
          return;
        }

        const itemId = item.key || item.item?.id || `item-${item.index}`;
        newVisible.push({
          id: itemId,
          index: item.index,
          timestamp: now,
        });

        // if item becomes visible and has not been exposed before, start exposure timer
        if (
          !previousVisible.has(itemId) &&
          !exposedItemsRef.current.has(itemId)
        ) {
          startFirstExposureTimer(itemId, item.index, {
            item: item.item,
            onExposure: optionsRef.current.onExposure,
          });
        }
      });

      // process invisible items
      visibleItemsRef.current.forEach(visibleItem => {
        if (!newVisible.find(v => v.id === visibleItem.id)) {
          stopExposureTimer(visibleItem.id);
        }
      });

      // update visible items record
      visibleItemsRef.current = newVisible;
    },
    [startFirstExposureTimer, stopExposureTimer],
  );

  /**
   * Check if an item has been exposed
   */
  const isItemExposed = useCallback(
    itemId => exposedItemsRef.current.has(itemId),
    [],
  );

  /**
   * Get the list of exposed item IDs
   */
  const getExposedItemIds = useCallback(() => {
    return Array.from(exposedItemsRef.current);
  }, []);

  /**
   * Get the current visible items
   */
  const getVisibleItems = useCallback(() => {
    return visibleItemsRef.current;
  }, []);

  /**
   * Reset exposure data
   */
  const resetExposureData = useCallback(() => {
    exposedItemsRef.current.clear();
    visibleItemsRef.current = [];
    exposureTimersRef.current.forEach(timer => clearTimeout(timer));
    exposureTimersRef.current.clear();
  }, []);

  // clear timers on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      exposureTimersRef.current.forEach(timer => clearTimeout(timer));
      exposureTimersRef.current.clear();
    };
  }, []);

  return {
    // data
    isItemExposed,

    // core method
    onViewableItemsChanged: handleViewableItemsChanged,

    // utils methods
    getExposedItemIds,
    getVisibleItems,
    isItemVisible,
    resetExposureData,
  };
};
