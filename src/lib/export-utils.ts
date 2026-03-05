// ─── CSV Export ───────────────────────────────────────────────

export function convertToCSV(
  rows: Record<string, string | number | boolean | null | undefined>[]
): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const csvHeaders = headers.join(',');

  const csvRows = rows.map(row =>
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Wrap in quotes if contains comma, newline, or quote
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

export function downloadCSV(filename: string, data: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Date Helpers ─────────────────────────────────────────────

export function getQuarterLabel(date: Date): string {
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  return `Q${quarter}-${date.getFullYear()}`;
}

export function getQuarterDateRange(date: Date): { start: Date; end: Date } {
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  const year = date.getFullYear();
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return { start, end };
}

export function formatDateForFile(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isInDateRange(
  dateStr: string,
  start: Date,
  end: Date
): boolean {
  const date = new Date(dateStr);
  return date >= start && date <= end;
}

// ─── Export Filename Helper ───────────────────────────────────

export function buildFilename(
  prefix: string,
  period: string,
  extension: 'csv' | 'txt' = 'csv'
): string {
  const today = formatDateForFile(new Date());
  return `modaglimmora-${prefix}-${period}-${today}.${extension}`;
}
