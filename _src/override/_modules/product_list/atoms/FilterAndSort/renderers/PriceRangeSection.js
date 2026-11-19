import React, {useState} from 'react';
import {Text, TextInput} from 'react-native';

import i18next from 'i18next';

import CustomView from '@app/components/CustomView';
import {numberFormat} from '@app/helpers/General';
import {Colors} from '@app/styles';

import RangeSlider from '../atoms/RangeSlider';
import styles from '../styles';

/**
 * ---------------------------------------------------- *
 * Price renderer: min/max inputs + dual-thumb slider,
 * bidirectionally synced through the draft value.
 * Strict mapping: the left thumb always drives the left
 * (min) input, the right thumb the right (max) input —
 * values are clamped against each other, never swapped.
 * Typing pushes a clamped range so the thumb follows the
 * input live; blur commits the final clamp (an untouched
 * side keeps its draft value, an emptied side falls back
 * to its bound). While not focused the display derives
 * from the draft, so outside changes show up as-is.
 * ---------------------------------------------------- *
 */
const PriceRangeSection = ({bounds, draftValue, onChange}) => {
  const [minText, setMinText] = useState(null); // null = not editing
  const [maxText, setMaxText] = useState(null);

  const hasRange = (draftValue?.length ?? 0) > 0;
  const [draftLo, draftHi] = hasRange
    ? String(draftValue[0]).split('_').map(Number)
    : [bounds.min, bounds.max];

  const digitsOnly = text => text.replace(/[^0-9]/g, '');

  const clampTo = value =>
    Math.min(Math.max(value, bounds.min), bounds.max);

  const currentLo = hasRange && Number.isFinite(draftLo) ? draftLo : bounds.min;
  const currentHi = hasRange && Number.isFinite(draftHi) ? draftHi : bounds.max;

  // live linkage while typing: move only the edited thumb,
  // clamped against the other one — never swapped, so each
  // input stays on its own thumb
  const pushLive = (side, digits) => {
    if (side === 'min') {
      const raw = digits === '' ? bounds.min : clampTo(Number(digits));
      onChange([Math.min(raw, currentHi), currentHi]);
    } else {
      const raw = digits === '' ? bounds.max : clampTo(Number(digits));
      onChange([currentLo, Math.max(raw, currentLo)]);
    }
  };

  const startEditing = side => {
    if (side === 'min') {
      setMinText(hasRange && Number.isFinite(draftLo) ? String(draftLo) : '');
    } else {
      setMaxText(hasRange && Number.isFinite(draftHi) ? String(draftHi) : '');
    }
  };

  const commit = () => {
    if (minText === null && maxText === null) {
      return;
    }
    // null text = side untouched this round: keep its draft value
    const rawLo =
      minText === null
        ? currentLo
        : minText === ''
        ? bounds.min
        : Number(minText);
    const rawHi =
      maxText === null
        ? currentHi
        : maxText === ''
        ? bounds.max
        : Number(maxText);
    const nextLo = Math.min(clampTo(Number.isFinite(rawLo) ? rawLo : bounds.min), clampTo(Number.isFinite(rawHi) ? rawHi : bounds.max));
    const nextHi = Math.max(clampTo(Number.isFinite(rawLo) ? rawLo : bounds.min), clampTo(Number.isFinite(rawHi) ? rawHi : bounds.max));
    onChange([nextLo, nextHi]);
    setMinText(null);
    setMaxText(null);
  };

  const format = value => numberFormat('', value, ',', 0);

  // a thumb release wins over any in-progress text editing:
  // drop the local text so the focused input re-derives from
  // the draft (focus/keyboard unaffected), and the later
  // blur commit becomes a no-op instead of restoring stale digits
  const onSliderChange = range => {
    setMinText(null);
    setMaxText(null);
    onChange(range);
  };

  return (
    <CustomView paddingBottom={10}>
      <CustomView row verticalCenter paddingBottom={12}>
        <CustomView flex={1} row horizontalCenter verticalCenter style={styles.priceInputContainer}>
          <Text>IDR</Text>
          <TextInput
            value={
              minText !== null
                ? minText
                : hasRange && Number.isFinite(draftLo)
                ? format(draftLo)
                : ''
            }
            onChangeText={text => {
              const digits = digitsOnly(text);
              setMinText(digits);
              pushLive('min', digits);
            }}
            onFocus={() => startEditing('min')}
            onEndEditing={commit}
            onBlur={commit}
            placeholder={i18next.t('product_list.view.lowestPrice') || format(bounds.min)}
            placeholderTextColor={Colors.GRAY_SMOOTH5}
            keyboardType="number-pad"
            style={styles.priceInput}
          />
        </CustomView>
        <CustomView paddingHorizontal={8} horizontalCenter verticalCenter>
          <Text style={{fontSize: 14}}>{i18next.t('product_list.view.priceTo')}</Text>
        </CustomView>
        <CustomView flex={1} row horizontalCenter verticalCenter style={styles.priceInputContainer}>
          <Text>IDR</Text>
          <TextInput
            value={
              maxText !== null
                ? maxText
                : hasRange && Number.isFinite(draftHi)
                ? format(draftHi)
                : ''
            }
            onChangeText={text => {
              const digits = digitsOnly(text);
              setMaxText(digits);
              pushLive('max', digits);
            }}
            onFocus={() => startEditing('max')}
            onEndEditing={commit}
            onBlur={commit}
            placeholder={i18next.t('product_list.view.highestPrice') || format(bounds.max)}
            placeholderTextColor={Colors.GRAY_SMOOTH5}
            keyboardType="number-pad"
            style={styles.priceInput}
          />
      </CustomView>
      </CustomView>
      <CustomView>
        <RangeSlider
          min={bounds.min}
          max={bounds.max}
          value={[draftLo, draftHi]}
          step={1000}
          onChange={onSliderChange}
        />
      </CustomView>
    </CustomView>
  );
};

export default PriceRangeSection;
