/**
 * DateSeparator Component
 *
 * Menampilkan separator tanggal antara grup pesan dengan tanggal berbeda.
 * Digunakan untuk memisahkan pesan berdasarkan hari.
 *
 * Features:
 * - Centered layout dengan rounded-full badge
 * - Styling dengan bg-muted dan text-muted-foreground
 * - Padding untuk spacing yang comfortable
 * - Responsive text size
 *
 * @param date - Formatted date string (e.g., "Hari ini", "Kemarin", "12 Jan 2024")
 */

interface DateSeparatorProps {
  /** Formatted date string */
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:px-4 sm:py-1.5 sm:text-sm">
        {date}
      </div>
    </div>
  );
}
