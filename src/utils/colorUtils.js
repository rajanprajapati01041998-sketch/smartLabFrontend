// utils/colorUtils.js

export const getColorCode = (color) => {
  if (!color) return null; // ❌ error

  // If already HEX
  if (color.startsWith("#")) return color;

  const normalized = color.trim().toLowerCase();

  const colorMap = {
    "red": "#FF0000",
    "blue": "#0000FF",
    "green": "#008000",
    "purple": "#800080",
    "yellow": "#FFFF00",
    "orange": "#FFA500",
    "black": "#000000",
    "white": "#FFFFFF",
    "pink": "#FFC0CB",
    "brown": "#A52A2A",
    "gray": "#808080",
    "grey": "#808080",

    "deep sky blue": "#00BFFF",
    "light blue": "#ADD8E6",
    "light green": "#90EE90",

    "container": "#607D8B",
    "other": "#9E9E9E"
  };

  return colorMap[normalized] || null; // ❌ return null if not match
};