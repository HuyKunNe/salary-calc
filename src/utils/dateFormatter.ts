export function excelToLocalTime(
  excelTimestamp: number,
  timezoneOffset = 7
): string {
  // Excel's epoch is 1900-01-01 (UTC)
  const excelEpoch = new Date(1900, 0, 1);
  excelEpoch.setFullYear(1900); // Fix year-1900 bug in JavaScript

  // Convert Excel timestamp to milliseconds (UTC)
  const utcMilliseconds = (excelTimestamp - 1) * 86400000; // -1 to fix Excel's 1900 leap year bug

  // Create UTC date
  const utcDate = new Date(excelEpoch.getTime() + utcMilliseconds);

  // Convert to GMT+7
  const gmt7Offset = timezoneOffset * 60 * 60 * 1000;
  const localDate = new Date(utcDate.getTime() + gmt7Offset);

  // Format components (no leading zeros for month/day)
  const pad = (num: number) => num.toString().padStart(2, "0");
  return (
    `${
      localDate.getMonth() + 1
    }/${localDate.getDate()}/${localDate.getFullYear()} ` +
    `${localDate.getHours()}:${pad(localDate.getMinutes())}:${pad(
      localDate.getSeconds()
    )}`
  );
}

export function excelDaysToDate(excelDays: number): string {
  // Excel's epoch is 1900-01-01 (with 1900 incorrectly treated as a leap year)
  const excelEpoch = new Date(1900, 0, 1);
  excelEpoch.setFullYear(1900); // Fix JavaScript Date's 1900 handling

  // Adjust for Excel's leap year bug (removing the phantom 1900-02-29)
  const adjustedDays = excelDays > 59 ? excelDays - 1 : excelDays;

  // Calculate the date (UTC to avoid timezone issues)
  const utcDate = new Date(excelEpoch.getTime() + adjustedDays * 86400000);

  // Format as M/D/YYYY (no leading zeros)
  return `${
    utcDate.getMonth() + 1
  }/${utcDate.getDate()}/${utcDate.getFullYear()}`;
}
