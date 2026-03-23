/**
 * Product Reports / Complaints Service
 * Consumer reports product issues → Admin moderates → Brand gets warned
 *
 * localStorage until backend API exists.
 * Future endpoints:
 * POST   /api/v1/customer/reports         — Consumer submits report
 * GET    /api/v1/admin/reports             — Admin sees all reports
 * PATCH  /api/v1/admin/reports/{id}        — Admin takes action
 * GET    /api/v1/brand/reports             — Brand sees warnings/actions
 */

const REPORTS_KEY = 'moda-product-reports';

export type ReportReason = 'poor_quality' | 'not_as_described' | 'counterfeit' | 'damaged' | 'misleading_price' | 'inappropriate' | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'warning_sent' | 'product_removed' | 'brand_suspended' | 'dismissed';

export interface ProductReport {
  id: string;
  // Product info
  product_id: string;
  product_name: string;
  product_image?: string;
  product_price?: number;
  // Brand info
  brand_id: string;
  brand_name: string;
  // Reporter info
  customer_id: string;
  customer_name: string;
  customer_email: string;
  order_id?: string;
  // Report details
  reason: ReportReason;
  description: string;
  evidence_urls?: string[];
  // Admin action
  status: ReportStatus;
  admin_notes?: string;
  action_taken?: string;
  // Timestamps
  reported_at: string;
  resolved_at?: string;
}

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'poor_quality', label: 'Poor Quality', description: 'Product quality does not match expectations' },
  { value: 'not_as_described', label: 'Not As Described', description: 'Product differs from listing description' },
  { value: 'counterfeit', label: 'Suspected Counterfeit', description: 'Product appears to be fake or counterfeit' },
  { value: 'damaged', label: 'Damaged on Arrival', description: 'Product was damaged during shipping' },
  { value: 'misleading_price', label: 'Misleading Pricing', description: 'Price was misleading or changed after purchase' },
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Product listing contains inappropriate content' },
  { value: 'other', label: 'Other', description: 'Other issue not listed above' },
];

function getReports(): ProductReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveReports(reports: ProductReport[]): void {
  try { localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); } catch {}
}

// Consumer: submit a product report
export function submitProductReport(data: {
  product_id: string;
  product_name: string;
  product_image?: string;
  product_price?: number;
  brand_id: string;
  brand_name: string;
  order_id?: string;
  reason: ReportReason;
  description: string;
}): ProductReport {
  const reports = getReports();
  const userData = typeof window !== 'undefined' ? localStorage.getItem('moda-user-data') : null;
  const user = userData ? JSON.parse(userData) : {};

  const report: ProductReport = {
    id: `rpt-${Date.now().toString(36)}`,
    ...data,
    customer_id: user.user_id || user.id || '',
    customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer',
    customer_email: user.email || '',
    status: 'pending',
    reported_at: new Date().toISOString(),
  };

  reports.unshift(report);
  saveReports(reports);
  return report;
}

// Admin: get all reports
export function getAllReports(): ProductReport[] {
  return getReports();
}

// Admin: get reports for a specific brand
export function getReportsByBrand(brandId: string): ProductReport[] {
  return getReports().filter(r => r.brand_id === brandId);
}

// Admin: get report count by brand (for warning level)
export function getBrandWarningLevel(brandId: string): { total: number; level: 'none' | 'low' | 'medium' | 'high' } {
  const brandReports = getReports().filter(r => r.brand_id === brandId && r.status !== 'dismissed');
  const total = brandReports.length;
  return {
    total,
    level: total >= 5 ? 'high' : total >= 3 ? 'medium' : total >= 1 ? 'low' : 'none',
  };
}

// Admin: update report status + take action
export function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNotes?: string,
  actionTaken?: string,
): ProductReport | null {
  const reports = getReports();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx === -1) return null;

  reports[idx] = {
    ...reports[idx],
    status,
    admin_notes: adminNotes,
    action_taken: actionTaken,
    resolved_at: ['pending', 'investigating'].includes(status) ? undefined : new Date().toISOString(),
  };
  saveReports(reports);
  return reports[idx];
}

// Consumer: check if user already reported a product
export function hasReportedProduct(productId: string): boolean {
  const userData = typeof window !== 'undefined' ? localStorage.getItem('moda-user-data') : null;
  const user = userData ? JSON.parse(userData) : {};
  const userId = user.user_id || user.id || '';
  return getReports().some(r => r.product_id === productId && r.customer_id === userId);
}
