import { PixelRatio } from 'react-native';

/**
 * Design reference (logical width × height). Layouts designed at this size scale smoothly.
 * Adjust if your Figma / design system uses a different artboard.
 */
export const DESIGN_WIDTH = 375;
export const DESIGN_HEIGHT = 812;

/**
 * Build responsive helpers for a given window size. Used by ResponsiveProvider / useResponsive.
 * Font sizes use `moderateScale` only; keep `<Text allowFontScaling>` (default) so system accessibility text size still applies on top.
 *
 * @param {number} width
 * @param {number} height
 */
export function createResponsiveHelpers(width, height) {
  const shortSide = Math.min(width, height);

  /** Scale by width (good for horizontal padding, icon widths). */
  const scale = (size) => (shortSide / DESIGN_WIDTH) * size;

  /** Scale by height (vertical spacing, row heights). */
  const verticalScale = (size) => (height / DESIGN_HEIGHT) * size;

  /**
   * Between `scale` and original size — avoids over-shrinking on small phones / over-growing on tablets.
   * @param {number} size
   * @param {number} [factor=0.5] 0 = no scale, 1 = full scale()
   */
  const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

  /** Width as % of screen (0–100). */
  const wp = (percent) => (width * percent) / 100;

  /** Height as % of screen (0–100). */
  const hp = (percent) => (height * percent) / 100;

  /**
   * Responsive font size from design px. Use for `style={{ fontSize: font(16) }}`.
   * System “larger text” still applies via Text default `allowFontScaling`.
   */
  const font = (size) =>
    PixelRatio.roundToNearestPixel(moderateScale(size, 0.5));

  /** Line height from a body font size multiplier. */
  const lineHeight = (size, multiplier = 1.25) =>
    PixelRatio.roundToNearestPixel(font(size) * multiplier);

  /** Padding / margin spacing (same curve as fonts). */
  const spacing = (size) => PixelRatio.roundToNearestPixel(moderateScale(size, 0.5));

  /** Border radius — slightly less aggressive than full scale. */
  const radius = (size) => PixelRatio.roundToNearestPixel(moderateScale(size, 0.35));

  /** Icon / touch target sizes. */
  const icon = (size) => PixelRatio.roundToNearestPixel(moderateScale(size, 0.45));

  return {
    width,
    height,
    shortSide,
    scale,
    verticalScale,
    moderateScale,
    wp,
    hp,
    font,
    lineHeight,
    spacing,
    radius,
    icon,
    /** Typical tablet breakpoint (short side). */
    isTablet: shortSide >= 600,
    /** Very narrow phones. */
    isSmallPhone: shortSide < 360,
    isPortrait: height >= width,
    isLandscape: width > height,
  };
}
