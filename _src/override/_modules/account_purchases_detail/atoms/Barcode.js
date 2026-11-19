import React, {useMemo} from 'react';

import Svg, {Rect} from 'react-native-svg';

/**
 * Code 128 symbol patterns (values 0 - 106).
 * Each pattern is a binary string where 1 = bar (black) and 0 = space
 * (white); every data symbol is 11 modules wide, the stop symbol is 13
 * modules (includes the 2-module termination bar).
 * Table data sourced from JsBarcode (github.com/lindell/JsBarcode).
 */
const BARS = [
  '11011001100',
  '11001101100',
  '11001100110',
  '10010011000',
  '10010001100',
  '10001001100',
  '10011001000',
  '10011000100',
  '10001100100',
  '11001001000',
  '11001000100',
  '11000100100',
  '10110011100',
  '10011011100',
  '10011001110',
  '10111001100',
  '10011101100',
  '10011100110',
  '11001110010',
  '11001011100',
  '11001001110',
  '11011100100',
  '11001110100',
  '11101101110',
  '11101001100',
  '11100101100',
  '11100100110',
  '11101100100',
  '11100110100',
  '11100110010',
  '11011011000',
  '11011000110',
  '11000110110',
  '10100011000',
  '10001011000',
  '10001000110',
  '10110001000',
  '10001101000',
  '10001100010',
  '11010001000',
  '11000101000',
  '11000100010',
  '10110111000',
  '10110001110',
  '10001101110',
  '10111011000',
  '10111000110',
  '10001110110',
  '11101110110',
  '11010001110',
  '11000101110',
  '11011101000',
  '11011100010',
  '11011101110',
  '11101011000',
  '11101000110',
  '11100010110',
  '11101101000',
  '11101100010',
  '11100011010',
  '11101111010',
  '11001000010',
  '11110001010',
  '10100110000',
  '10100001100',
  '10010110000',
  '10010000110',
  '10000101100',
  '10000100110',
  '10110010000',
  '10110000100',
  '10011010000',
  '10011000010',
  '10000110100',
  '10000110010',
  '11000010010',
  '11001010000',
  '11110111010',
  '11000010100',
  '10001111010',
  '10100111100',
  '10010111100',
  '10010011110',
  '10111100100',
  '10011110100',
  '10011110010',
  '11110100100',
  '11110010100',
  '11110010010',
  '11011011110',
  '11011110110',
  '11110110110',
  '10101111000',
  '10100011110',
  '10001011110',
  '10111101000',
  '10111100010',
  '11110101000',
  '11110100010',
  '10111011110',
  '10111101110',
  '11101011110',
  '11110101110',
  '11010000100',
  '11010010000',
  '11010011100',
  '1100011101011',
];

const MODULO = 103;
const START_B = 104;
const START_C = 105;
const SWITCH_TO_C = 99;
const STOP = 106;
const QUIET_ZONE_MODULES = 10;
const DEFAULT_MODULE_WIDTH = 2;
const DEFAULT_MAX_WIDTH = 320;
const DEFAULT_HEIGHT = 56;

/**
 * Build the Code 128 binary pattern (bars/spaces) for a value.
 * - Digits with even length -> code set C (2 digits per symbol, denser)
 * - Anything else printable -> code set B (1 character per symbol)
 * Returns null when there is nothing to encode.
 */
const encodeCode128 = value => {
  if (!value) {
    return null;
  }
  const clean = String(value).replace(/[^\x20-\x7E]/g, '');
  if (!clean.trim()) {
    return null;
  }
  const symbols = [];
  const isAllDigits = /^\d+$/.test(clean);
  if (isAllDigits && clean.length % 2 === 0) {
    symbols.push(START_C);
    for (let i = 0; i < clean.length; i += 2) {
      symbols.push(Number(clean.slice(i, i + 2)));
    }
  } else {
    symbols.push(START_B);
    if (isAllDigits) {
      // Odd digit count: encode the first digit in set B, then switch.
      symbols.push(clean.charCodeAt(0) - 32);
      if (clean.length > 1) {
        symbols.push(SWITCH_TO_C);
        for (let i = 1; i < clean.length; i += 2) {
          symbols.push(Number(clean.slice(i, i + 2)));
        }
      }
    } else {
      for (let i = 0; i < clean.length; i += 1) {
        symbols.push(clean.charCodeAt(i) - 32);
      }
    }
  }

  // Mandatory modulo-103 checksum over start + data symbols.
  let checksum = symbols[0];
  for (let i = 1; i < symbols.length; i += 1) {
    checksum += symbols[i] * i;
  }
  symbols.push(checksum % MODULO, STOP);
  return symbols.map(code => BARS[code]).join('');
};

/**
 * One-dimensional Code 128 barcode rendered with react-native-svg.
 * Black bars only, no built-in text (callers render the AWB number
 * themselves, matching the tracking-number design).
 *
 * @param {string} props.value    Value to encode (e.g. AWB number).
 * @param {number} props.height   Bar height in dp.
 * @param {number} props.maxWidth Maximum total width in dp; the module
 *                                width shrinks when data would overflow.
 * @param {string} props.color    Bar color.
 * @param {object} props.style    Extra style applied to the Svg.
 * @returns {null|object} Barcode Svg element, null without a value.
 */
const Barcode = ({
  value,
  height = DEFAULT_HEIGHT,
  maxWidth = DEFAULT_MAX_WIDTH,
  color = '#000000',
  style,
}) => {
  const bars = useMemo(() => {
    const binary = encodeCode128(value);
    if (!binary) {
      return null;
    }
    const totalModules = binary.length + QUIET_ZONE_MODULES * 2;
    const moduleWidth = Math.min(DEFAULT_MODULE_WIDTH, maxWidth / totalModules);
    const rects = [];
    let runStart = -1;
    for (let i = 0; i <= binary.length; i += 1) {
      const isBar = binary[i] === '1';
      if (isBar && runStart < 0) {
        runStart = i;
      } else if (!isBar && runStart >= 0) {
        rects.push({
          key: `bar-${runStart}`,
          x: (QUIET_ZONE_MODULES + runStart) * moduleWidth,
          width: (i - runStart) * moduleWidth,
        });
        runStart = -1;
      }
    }
    return {rects, width: totalModules * moduleWidth};
  }, [value, maxWidth]);

  if (!bars) {
    return null;
  }

  return (
    <Svg width={bars.width} height={height} style={style}>
      {bars.rects.map(rect => (
        <Rect
          key={rect.key}
          x={rect.x}
          y={0}
          width={rect.width}
          height={height}
          fill={color}
        />
      ))}
    </Svg>
  );
};

export default Barcode;
