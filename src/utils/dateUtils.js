export const formatBillDateTime = (dateString) => {
  if (!dateString) return "";

  try {
    const clean = String(dateString).replace(/\s+/g, " ").trim();

    const match = clean.match(
      /^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})(AM|PM)$/i
    );

    if (!match) return clean;

    const [, monthName, day, year, hour, minute, ampm] = match;

    const months = {
      Jan: 0, January: 0,
      Feb: 1, February: 1,
      Mar: 2, March: 2,
      Apr: 3, April: 3,
      May: 4,
      Jun: 5, June: 5,
      Jul: 6, July: 6,
      Aug: 7, August: 7,
      Sep: 8, Sept: 8, September: 8,
      Oct: 9, October: 9,
      Nov: 10, November: 10,
      Dec: 11, December: 11,
    };

    let h = Number(hour);
    const m = Number(minute);

    if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
    if (ampm.toUpperCase() === "AM" && h === 12) h = 0;

    const date = new Date(
      Number(year),
      months[monthName],
      Number(day),
      h,
      m
    );

    return date
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/am/i, "AM")
      .replace(/pm/i, "PM"); // 🔥 FIX HERE

  } catch {
    return dateString;
  }
};