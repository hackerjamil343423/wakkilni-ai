export interface ColumnConfig {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  format?: "currency" | "number" | "percentage" | "text";
  align?: "left" | "center" | "right";
}

export const SEARCH_CAMPAIGN_COLUMNS: ColumnConfig[] = [
  {
    key: "name",
    label: "Campaign / Ad Group / Keyword",
    width: "35%",
    sortable: true,
    format: "text",
    align: "left",
  },
  {
    key: "status",
    label: "Status",
    width: "10%",
    sortable: true,
    format: "text",
    align: "center",
  },
  {
    key: "spend",
    label: "Spend",
    width: "12%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "impressions",
    label: "Impr.",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "clicks",
    label: "Clicks",
    width: "8%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "ctr",
    label: "CTR",
    width: "8%",
    sortable: true,
    format: "percentage",
    align: "right",
  },
  {
    key: "conversions",
    label: "Conv.",
    width: "8%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "cpa",
    label: "CPA",
    width: "9%",
    sortable: true,
    format: "currency",
    align: "right",
  },
];

export const SEARCH_TERM_COLUMNS: ColumnConfig[] = [
  {
    key: "term",
    label: "Search Term",
    width: "35%",
    sortable: true,
    format: "text",
    align: "left",
  },
  {
    key: "matchType",
    label: "Match Type",
    width: "12%",
    sortable: true,
    format: "text",
    align: "center",
  },
  {
    key: "impressions",
    label: "Impressions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "clicks",
    label: "Clicks",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "spend",
    label: "Spend",
    width: "12%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "conversions",
    label: "Conversions",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "conversionRate",
    label: "Conv. Rate",
    width: "9%",
    sortable: true,
    format: "percentage",
    align: "right",
  },
];

export const PMAX_LISTING_COLUMNS: ColumnConfig[] = [
  {
    key: "productTitle",
    label: "Product",
    width: "30%",
    sortable: true,
    format: "text",
    align: "left",
  },
  {
    key: "status",
    label: "Status",
    width: "12%",
    sortable: true,
    format: "text",
    align: "center",
  },
  {
    key: "spend",
    label: "Spend",
    width: "12%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "impressions",
    label: "Impressions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "clicks",
    label: "Clicks",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "conversions",
    label: "Conversions",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "cpa",
    label: "CPA",
    width: "10%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "roas",
    label: "ROAS",
    width: "8%",
    sortable: true,
    format: "ratio",
    align: "right",
  },
];

export const VIDEO_PERFORMANCE_COLUMNS: ColumnConfig[] = [
  {
    key: "title",
    label: "Video Title",
    width: "30%",
    sortable: true,
    format: "text",
    align: "left",
  },
  {
    key: "impressions",
    label: "Impressions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "views",
    label: "Views",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "viewRate",
    label: "View Rate",
    width: "12%",
    sortable: true,
    format: "percentage",
    align: "right",
  },
  {
    key: "spend",
    label: "Spend",
    width: "12%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "conversions",
    label: "Conversions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "roas",
    label: "ROAS",
    width: "10%",
    sortable: true,
    format: "ratio",
    align: "right",
  },
];

export const DEMOGRAPHIC_COLUMNS: ColumnConfig[] = [
  {
    key: "age",
    label: "Age Range",
    width: "20%",
    sortable: true,
    format: "text",
    align: "left",
  },
  {
    key: "gender",
    label: "Gender",
    width: "15%",
    sortable: true,
    format: "text",
    align: "center",
  },
  {
    key: "impressions",
    label: "Impressions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "clicks",
    label: "Clicks",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "spend",
    label: "Spend",
    width: "12%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "conversions",
    label: "Conversions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "cpa",
    label: "CPA",
    width: "10%",
    sortable: true,
    format: "currency",
    align: "right",
  },
];

export const GEO_COLUMNS: ColumnConfig[] = [
  {
    key: "countryName",
    label: "Country",
    width: "25%",
    sortable: true,
    format: "text",
    align: "left",
  },
  {
    key: "impressions",
    label: "Impressions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "clicks",
    label: "Clicks",
    width: "10%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "spend",
    label: "Spend",
    width: "12%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "conversions",
    label: "Conversions",
    width: "12%",
    sortable: true,
    format: "number",
    align: "right",
  },
  {
    key: "cpa",
    label: "CPA",
    width: "12%",
    sortable: true,
    format: "currency",
    align: "right",
  },
  {
    key: "roas",
    label: "ROAS",
    width: "10%",
    sortable: true,
    format: "ratio",
    align: "right",
  },
];

export function formatCellValue(value: unknown, format?: string): string {
  if (value === null || value === undefined) return "-";

  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  if (format === "percentage") {
    return `${(Number(value) * 100).toFixed(2)}%`;
  }

  if (format === "ratio") {
    return `${Number(value).toFixed(2)}x`;
  }

  if (format === "number") {
    return new Intl.NumberFormat("en-US").format(Number(value));
  }

  return String(value);
}
