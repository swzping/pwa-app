import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useApolloClient} from '@apollo/client';

import _ from 'lodash';

import {
  GET_CATEGORIES_PRODUCT_LIST,
  GET_PRODUCT_SEARCH,
  GET_PRODUCTS_TOTAL_COUNT,
} from '@app/_modules/product_list/services/schema';
import {
  BRAND,
  CATEGORY,
  CATEGORY_ID,
  PRICE,
  SEARCH,
  sortByPLP,
} from '@app/helpers/Constants';
import {numberFormat} from '@app/helpers/General';

const DISCOUNT_PERCENTAGE = 'discount_percentage';

// PRD: sort options are scene-scoped — Search hides Position,
// Category hides Best Match, Brand hides both. Matched by the
// option label exactly as spelled in Constants (sortByPLP.items);
// "Default" (value null) always stays
const HIDDEN_SORT_LABELS_BY_TYPE = {
  [BRAND]: ['Position', 'Best Match'],
  [CATEGORY]: ['Best Match'],
  [SEARCH]: ['Position'],
};

/**
 * ---------------------------------------------------- *
 * @function getProductListDefaultSort
 * @summary default sort for product list,
 * search page sorts by relevance, category page by position,
 * both keep in-stock items first
 * ---------------------------------------------------- *
 */
export const getProductListDefaultSort = isSearch =>
  isSearch
    ? {relevance: 'DESC', stock_status: 'DESC'}
    : {position: 'ASC', stock_status: 'DESC'};

/**
 * ---------------------------------------------------- *
 * @function getClearedFilters
 * @summary reset every attribute to an empty selection,
 * keeping the attribute keys themselves
 * ---------------------------------------------------- *
 */
export const getClearedFilters = sourceFilters => {
  return Object.keys(sourceFilters || {}).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});
};

/**
 * ---------------------------------------------------- *
 * @function buildFilterPayload
 * @summary convert {attribute_code: [values]} into
 * magento filter input (brand / price / anotherFilter)
 * ---------------------------------------------------- *
 */
export const buildFilterPayload = activeFilters => {
  let brand;
  let price;
  const anotherFilter = {};

  if (activeFilters) {
    const attributeCodes = Object.keys(activeFilters);
    attributeCodes.forEach(code => {
      const values = activeFilters[code] || [];
      if (!values.length) {
        return;
      }
      if (code === BRAND) {
        brand = {in: values};
      } else if (code === PRICE) {
        let tmpPrice = [];
        for (let o = 0; o < values.length; o++) {
          tmpPrice.push(values[o].split('_'));
        }
        tmpPrice = [].concat.apply([], tmpPrice);
        const numericValues = tmpPrice.map(priceValue => Number(priceValue));
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        price = {from: min, to: max};
      } else if (code === DISCOUNT_PERCENTAGE) {
        // PRD "Has Discount": open-ended positive-discount filter
        if (values.length) {
          anotherFilter[code] = {from: values[0]};
        }
      } else {
        // API doc: facet attributes submit as {in: [...]} —
        // single-value and multi-value selections alike
        anotherFilter[code] = {in: values};
      }
    });
  }

  return {brand, price, anotherFilter};
};

/**
 * ---------------------------------------------------- *
 * @function useProductListFilter
 * @summary owns all PLP filter/sort state:
 * draft filters, applied filters, selected sort,
 * filter & sort modal visibility, and the queryVariables
 * composition built from them. List state (products,
 * loading, pagination) stays in the controller — the hook
 * hands the composed variables back through onApply.
 * ---------------------------------------------------- *
 */
export function useProductListFilter({
  aggregations,
  type,
  categoryId,
  search,
  brandCategoryId,
  onApply,
}) {
  const isSearch = type === SEARCH;
  // memoized: a fresh object identity every render would rebuild
  // composeQueryVariables every render and re-trigger the draft
  // count effect after each query completes (query loop)
  const defaultSort = useMemo(() => getProductListDefaultSort(isSearch), [
    isSearch,
  ]);
  const sortOptions = useMemo(() => {
    // single source list — the old sortBySearch/sortByPLP split only
    // reordered Position/Best Match, which the per-scene hidden
    // labels already express (each scene hides the other one)
    const hiddenLabels = HIDDEN_SORT_LABELS_BY_TYPE[type] || [];
    return sortByPLP.items.filter(
      item => item?.value == null || !hiddenLabels.includes(item.label),
    );
  }, [type]);

  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  // "Default" starts selected: its entry holds value null,
  // which composeQueryVariables resolves to defaultSort
  const [selectedSort, setSelectedSort] = useState(() => {
    const defaultIndex = sortOptions.findIndex(item => item?.value == null);
    return defaultIndex >= 0 ? defaultIndex : '';
  });
  const [visibleFilter, setVisibleFilter] = useState(false);
  const [visibleSort, setVisibleSort] = useState(false);
  const [draftFilterCount, setDraftFilterCount] = useState(null);
  const [isDraftCountLoading, setIsDraftCountLoading] = useState(false);
  const countRequestRef = useRef(0);
  const client = useApolloClient();

  /**
   * ----------------------------------------- *
   * initialize draft + applied filters from
   * the aggregations response; category_id is
   * not selectable on category pages
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (!aggregations) {
      return;
    }
    const tmpFilter = {};
    aggregations.forEach(aggregation => {
      if (categoryId && aggregation.attribute_code === CATEGORY_ID) {
        return;
      }
      tmpFilter[aggregation.attribute_code] = [];
    });
    // the Category facet (guidCategoryFacet) submits as
    // category_uid even when the aggregations response
    // doesn't carry that key
    if (!tmpFilter.category_uid) {
      tmpFilter.category_uid = [];
    }
    setFilters(tmpFilter);
    setAppliedFilters(_.cloneDeep(tmpFilter));
  }, [aggregations, categoryId]);

  const aggregationDictionary = useMemo(() => {
    return (aggregations || []).reduce((acc, aggregation) => {
      const options =
        aggregation?.options?.reduce((optionMap, option) => {
          optionMap[option.value] = option.label;
          return optionMap;
        }, {}) || {};
      acc[aggregation.attribute_code] = {
        label: aggregation.label,
        options,
      };
      return acc;
    }, {});
  }, [aggregations]);

  const appliedFilterChips = useMemo(() => {
    const chips = [];
    Object.entries(appliedFilters || {}).forEach(([attributeCode, values]) => {
      if (!Array.isArray(values) || values.length === 0) {
        return;
      }
      const optionMap = aggregationDictionary?.[attributeCode]?.options || {};
      values.forEach(value => {
        // custom price range written by the slider has no bucket key
        // in the aggregation dictionary — format it as a label instead
        if (
          attributeCode === PRICE &&
          values.length === 1 &&
          String(value).includes('_')
        ) {
          const [lo, hi] = String(value).split('_').map(Number);
          if (Number.isFinite(lo) && Number.isFinite(hi)) {
            chips.push({
              attributeCode,
              value,
              label: `${numberFormat('IDR', lo, ',', 0)} - ${numberFormat(
                'IDR',
                hi,
                ',',
                0,
              )}`,
            });
            return;
          }
        }
        const optionLabel = optionMap[value] || value;
        chips.push({
          attributeCode,
          value,
          label: optionLabel,
        });
      });
    });
    return chips;
  }, [appliedFilters, aggregationDictionary]);

  const appliedFilterCount = useMemo(() => {
    return Object.values(appliedFilters || {}).reduce(
      (count, values) => count + (values?.length || 0),
      0,
    );
  }, [appliedFilters]);

  const selectedSortLabel = useMemo(() => {
    return sortOptions?.[selectedSort]?.label;
  }, [sortOptions, selectedSort]);

  /**
   * ----------------------------------------- *
   * @function composeQueryVariables
   * @summary single place composing query variables
   * from filters + sort. Returns null when nothing
   * should fire (BRAND before url resolver resolves,
   * or unknown route type)
   * ----------------------------------------- *
   */
  const composeQueryVariables = useCallback(
    (activeFilters, sortValue) => {
      const {brand, price, anotherFilter} = buildFilterPayload(activeFilters);
      // ProductAttributeFilterInput rejects category_id and
      // category_uid together: when the Category facet has
      // selections, its category_uid takes priority and the
      // page's category_id base is dropped (facet values are
      // children of the page node, so results stay in scope)
      const hasCategoryUidSelection =
        (activeFilters.category_uid ?? []).length > 0;
      const composedFilters = {
        ...(brand ? {brand} : {}),
        ...(price ? {price} : {}),
        ...anotherFilter,
      };
      // "Default" (value: null) and no selection both fall
      // back to the page's defaultSort
      const sort = {
        ...(sortValue !== '' && sortOptions?.[sortValue]?.value
          ? sortOptions[sortValue].value
          : defaultSort),
      };

      let queryVariables = null;
      let querySchema = GET_CATEGORIES_PRODUCT_LIST;
      switch (type) {
        case BRAND:
          if (brandCategoryId != null) {
            queryVariables = {
              id: brandCategoryId,
              filters: hasCategoryUidSelection
                ? composedFilters
                : {category_id: {eq: brandCategoryId}, ...composedFilters},
            };
          }
          break;
        case CATEGORY:
          queryVariables = {
            id: categoryId,
            filters: hasCategoryUidSelection
              ? composedFilters
              : {category_id: {eq: categoryId}, ...composedFilters},
          };
          break;
        case SEARCH:
          querySchema = GET_PRODUCT_SEARCH;
          queryVariables = {
            inputText: search,
            filters: {
              ...composedFilters,
            },
          };
          break;
      }

      if (!queryVariables) {
        return null;
      }
      return {
        queryVariables: {
          ...queryVariables,
          currentPage: 1,
          pageSize: 20,
          sort,
        },
        querySchema,
      };
    },
    [brandCategoryId, categoryId, defaultSort, search, sortOptions, type],
  );

  /**
   * ----------------------------------------- *
   * @function applyFilters
   * @summary commit draft (or given) filters and
   * refetch. Returns false when nothing fired —
   * appliedFilters is only committed with a real query
   * ----------------------------------------- *
   */
  const applyFilters = useCallback(
    activeFiltersParam => {
      const activeFilters = activeFiltersParam ?? filters;
      const composed = composeQueryVariables(activeFilters, selectedSort);
      if (!composed) {
        return false;
      }
      setAppliedFilters(_.cloneDeep(activeFilters));
      onApply(composed);
      return true;
    },
    [composeQueryVariables, filters, onApply, selectedSort],
  );

  /**
   * ----------------------------------------- *
   * @function selectSort
   * @summary change sort keeping the APPLIED filters
   * (not the draft — unconfirmed selections from a
   * closed-without-apply modal must not leak in).
   * Returns false when nothing fired
   * ----------------------------------------- *
   */
  const selectSort = useCallback(
    value => {
      setVisibleSort(false);
      setSelectedSort(value);
      const composed = composeQueryVariables(appliedFilters, value);
      if (!composed) {
        return false;
      }
      onApply(composed);
      return true;
    },
    [appliedFilters, composeQueryVariables, onApply],
  );

  /**
   * ----------------------------------------- *
   * @function toggleOption
   * @summary draft checkbox toggle; no-op when the
   * attribute key is not in the draft (e.g. category
   * groups shown on search pages with a categoryId)
   * ----------------------------------------- *
   */
  const toggleOption = useCallback((attributeCode, optionValue) => {
    setFilters(prev => {
      if (!Array.isArray(prev[attributeCode])) {
        return prev;
      }
      const next = prev[attributeCode].includes(optionValue)
        ? prev[attributeCode].filter(value => value !== optionValue)
        : [...prev[attributeCode], optionValue];
      return {...prev, [attributeCode]: next};
    });
  }, []);

  const clearDraftFilters = useCallback(() => {
    setFilters(prev => getClearedFilters(prev));
  }, []);

  /**
   * ----------------------------------------- *
   * @function setFilterValues
   * @summary replace the whole value array of one
   * attribute (price range writes/clears); no-op when
   * the attribute key is not in the draft
   * ----------------------------------------- *
   */
  const setFilterValues = useCallback((attributeCode, values) => {
    setFilters(prev => {
      if (!Array.isArray(prev[attributeCode])) {
        return prev;
      }
      return {...prev, [attributeCode]: values};
    });
  }, []);

  /**
   * ----------------------------------------- *
   * count of products matching the current DRAFT
   * filters, for the "Apply (N items)" footer.
   * Debounced + stale-response-guarded; composed with
   * the same composeQueryVariables the real apply
   * uses, so the count can never drift from what
   * Apply will fetch. Read-only, silent on failure
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (!visibleFilter) {
      return undefined;
    }
    const composed = composeQueryVariables(filters, selectedSort);
    const requestId = ++countRequestRef.current;
    setIsDraftCountLoading(true);
    if (!composed) {
      setDraftFilterCount(null);
      setIsDraftCountLoading(false);
      return undefined;
    }
    const {filters: filterPayload, inputText} = composed.queryVariables;
    const timer = setTimeout(async () => {
      try {
        const res = await client.query({
          query: GET_PRODUCTS_TOTAL_COUNT,
          variables: {
            filters: filterPayload,
            ...(inputText != null ? {inputText} : {}),
          },
          fetchPolicy: 'no-cache',
        });
        if (requestId === countRequestRef.current) {
          setDraftFilterCount(_.get(res, 'data.products.total_count') ?? null);
        }
      } catch (err) {
        // silent: a failed background count degrades to a plain "Apply"
        if (requestId === countRequestRef.current) {
          setDraftFilterCount(null);
        }
      } finally {
        if (requestId === countRequestRef.current) {
          setIsDraftCountLoading(false);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, visibleFilter, composeQueryVariables, selectedSort, client]);

  const removeAppliedFilter = useCallback(
    (attributeCode, value) => {
      const attributeValues = filters?.[attributeCode] || [];
      const filteredValues = attributeValues.filter(item => item !== value);
      const updatedFilters = {
        ...filters,
        [attributeCode]: filteredValues,
      };
      setFilters(updatedFilters);
      applyFilters(updatedFilters);
    },
    [applyFilters, filters],
  );

  /**
   * ----------------------------------------- *
   * @function toggleAppliedFilter
   * @summary header quick filter: toggle one value
   * straight into the applied filters and refetch —
   * no draft detour. No-op when the attribute key
   * is unknown (e.g. aggregations not loaded yet)
   * ----------------------------------------- *
   */
  const toggleAppliedFilter = useCallback(
    (attributeCode, optionValue) => {
      // quick chips may target attributes the aggregations
      // response doesn't carry (e.g. discount_percentage has
      // no facet) — seed the key on demand instead of no-op
      const attributeValues = Array.isArray(filters?.[attributeCode])
        ? filters[attributeCode]
        : [];
      const nextValues = attributeValues.includes(optionValue)
        ? attributeValues.filter(value => value !== optionValue)
        : [...attributeValues, optionValue];
      const updatedFilters = {...filters, [attributeCode]: nextValues};
      setFilters(updatedFilters);
      applyFilters(updatedFilters);
    },
    [applyFilters, filters],
  );

  const clearAppliedFilters = useCallback(() => {
    const clearedFilters = getClearedFilters(filters);
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  }, [applyFilters, filters]);

  // PRD: opening the panel copies the committed filters into
  // the pending (draft) state — the sheet never shows edits
  // left over from an earlier abandoned session
  const openFilter = useCallback(() => {
    setFilters(_.cloneDeep(appliedFilters));
    setVisibleFilter(true);
  }, [appliedFilters]);
  const closeFilter = useCallback(() => setVisibleFilter(false), []);

  return {
    // state
    filters,
    appliedFilters,
    selectedSort,
    selectedSortLabel,
    sortOptions,
    appliedFilterCount,
    appliedFilterChips,
    // modal visibility
    visibleFilter,
    visibleSort,
    openFilter,
    closeFilter,
    setVisibleSort,
    // actions
    toggleOption,
    clearDraftFilters,
    setFilterValues,
    draftFilterCount,
    isDraftCountLoading,
    applyFilters,
    selectSort,
    removeAppliedFilter,
    toggleAppliedFilter,
    clearAppliedFilters,
  };
}
