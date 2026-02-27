// ColorUtils.js

// Method to generate random hex color codes
export const generateColorCodes = (count = 20) => {

  const colors = [];

  for (let i = 0; i < count; i++) {

    const color =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');

    colors.push(color);
  }

  return colors;

};
