import React, {useMemo, useRef, useState} from 'react';
import {PanResponder, View} from 'react-native';

import {Colors} from '@app/styles';

import {makePriceScale as makeScale} from '../filterRenderers';

const THUMB_SIZE = 20;
const TRACK_HEIGHT = 4;
const THUMB_HIT_SLOP = 14;

const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

/**
 * ---------------------------------------------------- *
 * Pure-JS dual-thumb range slider (no native deps).
 * One container-level PanResponder: only a touch landing
 * on a thumb claims the gesture (the rest of the row
 * belongs to the sheet's scrolling — a stray horizontal
 * flick must never swing the prices), and once claimed
 * the gesture is owned until release (no mid-drag steal
 * from the list). When both thumbs overlap, the nearest
 * one is dragged.
 * Values commit to the parent ONCE on release so the
 * debounced count query is not spammed mid-drag.
 * ---------------------------------------------------- *
 */
const RangeSlider = ({min = 0, max = 100, value, onChange, step = 1}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [drag, setDragState] = useState(null); // {low, high} while a thumb is active
  const dragRef = useRef(null);
  const sideRef = useRef('low');
  // PanResponder callbacks read the freshest props through this ref,
  // so the responder can be created once and stay stable
  const latestRef = useRef({});
  latestRef.current = {min, max, step, onChange, trackWidth, value};

  const setDrag = next => {
    dragRef.current = next;
    setDragState(next);
  };

  const panResponder = useMemo(() => {
    // while dragging the thumb tracks the finger 1:1 (same
    // position the finger is at, no snapping); values are
    // snapped once on release so the track feels smooth
    const valueFromDx = (startValue, dx) => {
      const {min: lo, max: hi, trackWidth: width} = latestRef.current;
      const scale = makeScale(lo, hi);
      const position = clamp(
        scale.toPosition(startValue) + dx / (width || 1),
        0,
        1,
      );
      return clamp(scale.toValue(position), lo, hi);
    };

    // current thumb centers in container coordinates
    const thumbXs = () => {
      const {min: lo, max: hi, trackWidth: width, value: v} =
        latestRef.current;
      const scale = makeScale(lo, hi);
      const [pLow, pHigh] = v ?? [lo, hi];
      return [scale.toPosition(pLow) * width, scale.toPosition(pHigh) * width];
    };

    const isOnThumb = locationX => {
      const [loX, hiX] = thumbXs();
      return (
        Math.abs(locationX - loX) <= THUMB_SIZE / 2 + THUMB_HIT_SLOP ||
        Math.abs(locationX - hiX) <= THUMB_SIZE / 2 + THUMB_HIT_SLOP
      );
    };

    const nearestThumb = locationX => {
      const [loX, hiX] = thumbXs();
      return Math.abs(locationX - loX) <= Math.abs(locationX - hiX)
        ? 'low'
        : 'high';
    };

    const releaseHandler = () => {
      const dragState = dragRef.current;
      if (dragState) {
        const {min: lo, max: hi, step: st} = latestRef.current;
        const snapValue = val => clamp(Math.round(val / st) * st, lo, hi);
        latestRef.current.onChange?.([
          snapValue(dragState.low),
          snapValue(dragState.high),
        ]);
      }
      setDrag(null);
    };

    return PanResponder.create({
      // thumb-only claiming: a swipe landing anywhere else on the
      // row must never hijack a thumb (a horizontal-ish flick while
      // scrolling the sheet used to grab the nearest thumb and
      // swing the prices — "casual drag = huge jump")
      onStartShouldSetPanResponder: e => isOnThumb(e.nativeEvent.locationX),
      onMoveShouldSetPanResponder: () => false,
      // once a thumb is claimed, own the gesture until release —
      // yielding to the sheet's scroll mid-drag cancelled it
      // without committing and left the thumb feeling stuck
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: e => {
        const {min: lo, max: hi} = latestRef.current;
        const [pLow, pHigh] = latestRef.current.value ?? [lo, hi];
        sideRef.current = nearestThumb(e.nativeEvent.locationX);
        setDrag({low: pLow, high: pHigh});
      },
      onPanResponderMove: (_e, g) => {
        const base = dragRef.current;
        if (!base) {
          return;
        }
        const next = valueFromDx(
          sideRef.current === 'low' ? base.low : base.high,
          g.dx,
        );
        // thumbs never cross: dragging one past the other
        // pushes the other along, so the pair can't get stuck
        // when both sit on the same spot
        setDrag(
          sideRef.current === 'low'
            ? {low: Math.min(next, base.high), high: Math.max(next, base.high)}
            : {low: Math.min(next, base.low), high: Math.max(next, base.low)},
        );
      },
      onPanResponderRelease: releaseHandler,
      onPanResponderTerminate: () => setDrag(null),
    });
  }, []);

  const scale = makeScale(min, max);
  const [propLow, propHigh] = value ?? [min, max];
  const low = drag ? drag.low : propLow;
  const high = drag ? drag.high : propHigh;
  const lowX = scale.toPosition(low) * trackWidth;
  const highX = scale.toPosition(high) * trackWidth;

  return (
    <View
      {...panResponder.panHandlers}
      onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
      style={{height: THUMB_SIZE, justifyContent: 'center', marginHorizontal: 10}}>
      {/* purely decorative children: pointerEvents none keeps every
          touch targeted at this container, so locationX-based thumb
          hit-testing stays in container coordinates */}
      <View
        pointerEvents="none"
        style={{
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: Colors.GRAY_LIGHT,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: lowX - THUMB_SIZE / 2,
          width: Math.max(highX - lowX + THUMB_SIZE, 0),
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: Colors.PRIMARY,
        }}
      />
      {[
        {side: 'low', x: lowX},
        {side: 'high', x: highX},
      ].map(thumb => (
        <View
          key={thumb.side}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: thumb.x - THUMB_SIZE / 2,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: Colors.PRIMARY,
            borderWidth: 2,
            borderColor: Colors.WHITE,
            shadowColor: Colors.BLACK,
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      ))}
    </View>
  );
};

export default RangeSlider;
