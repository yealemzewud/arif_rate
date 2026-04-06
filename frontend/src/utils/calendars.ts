/**
 * ArifRate Calendar Utilities
 * Handles conversion between Gregorian, Hijri, and Ethiopian timelines.
 */

export interface UnifiedDate {
  gregorian: string;
  hijri: string;
  ethiopian: string;
  isHoliday?: boolean;
}

/**
 * Converts a Gregorian date string (YYYY-MM-DD) to a Triple Calendar context.
 */
export const getUnifiedDate = (dateStr: string): UnifiedDate => {
  const date = new Date(dateStr);
  
  // 1. Gregorian (Standard)
  const gregorian = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // 2. Hijri (Islamic)
  // Using u-ca-islamic locale extension for accurate Hijri conversion
  const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-uma', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const hijri = hijriFormatter.format(date);

  // 3. Ethiopian (Simplified Ge'ez)
  // Standard conversion: Ethiopian year is 7 or 8 years behind Gregorian.
  // New Year is Sept 11 (or Sept 12 in Gregorian leap years).
  const ethiopian = formatEthiopianDate(date);

  return { gregorian, hijri, ethiopian };
};

/**
 * Basic Ethiopian Date Logic (Common Era)
 * For a production app, we would use a more robust library like 'ethiopian-date',
 * but a specialized helper is sufficient for display logic here.
 */
function formatEthiopianDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Offset calculation (approximate for display context)
  let ethYear = year - 8;
  let ethMonth = 0;
  let ethDay = 0;

  // Ethiopian months (12 months of 30 days, 1 month of 5-6 days)
  const ethiopianMonths = [
    "Meskarem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yakatit", 
    "Magabit", "Miyazya", "Ginbot", "Sene", "Hamle", "Nehasse", "Pagume"
  ];

  // Simplified logic for resort booking context (Sept start)
  // This is a common approximate conversion for hospitality UIs
  if (month > 9 || (month === 9 && day >= 11)) {
    ethYear = year - 7;
  }

  // Monthly logic (approximate shifts)
  // Sept 11 is Meskarem 1
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
  const ethDayOfYear = (dayOfYear + 112) % 365; // Shift to Meskarem
  
  ethMonth = Math.floor(ethDayOfYear / 30);
  ethDay = (ethDayOfYear % 30) + 1;

  if (ethMonth >= 13) ethMonth = 12;

  return `${ethiopianMonths[ethMonth]} ${ethDay}, ${ethYear}`;
}
