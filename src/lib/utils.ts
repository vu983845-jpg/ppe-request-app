import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkEarlyReplacement(req: any) {
  if (!req.last_receipt_date || !req.ppe_master?.life_span_months) return false;
  const lastDate = new Date(req.last_receipt_date);
  const reqDate = new Date(req.created_at);
  const diffTime = reqDate.getTime() - lastDate.getTime();
  if (diffTime < 0) return false; // Edge case
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays < (req.ppe_master.life_span_months * 30); // ~30 days per month
}

export function getPpeName(ppe: any, locale: string) {
  if (!ppe) return '';
  return locale === 'en' && ppe.name_en ? ppe.name_en : ppe.name;
}
