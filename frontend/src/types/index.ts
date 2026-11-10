// Mirrors docs/DATA_MODEL.md §6. Keep in sync with the backend DTOs.

export type DataLocale = "zh" | "en";
export type LocalizedText = Record<DataLocale, string>;

export type CategoryType = "LIGHT_TYPE" | "SPACE" | "PROJECT";

// ISO 3166-2:TW
export type CountyCode =
  | "TW-KEE" | "TW-TPE" | "TW-NWT" | "TW-TAO" | "TW-HSZ" | "TW-HSQ"
  | "TW-MIA" | "TW-TXG" | "TW-CHA" | "TW-NAN" | "TW-YUN" | "TW-CYI"
  | "TW-CYQ" | "TW-TNN" | "TW-KHH" | "TW-PIF" | "TW-ILA" | "TW-HUA"
  | "TW-TTT" | "TW-PEN" | "TW-KIN" | "TW-LIE";
export type ProductFileKind = "CATALOG_PDF" | "IES" | "CAD";

export interface Category {
  id: number;
  type: CategoryType;
  slug: string;
  name: LocalizedText;
  sortOrder: number;
}

export interface Image {
  id: number;
  url: string;
  alt?: LocalizedText;
  sortOrder: number;
}

export interface ProductFile {
  id: number;
  kind: ProductFileKind;
  url: string;
  fileName: string;
  sizeBytes?: number;
}

export interface Product {
  id: number;
  slug: string;
  modelNo: string;
  name: LocalizedText;
  wattage?: string;
  colorTemperature?: string;
  dimensions?: string;
  ipRating?: string;
  price?: number;
  priceVisible: boolean;
  categoryIds: number[];
  images: Image[];
  applicationImages: Image[];
  files: ProductFile[];
}

export interface Project {
  id: number;
  slug: string;
  title: LocalizedText;
  description?: LocalizedText;
  year: number;
  categoryIds: number[];
  location: LocalizedText;
  countyCode: CountyCode;
  latitude?: number;
  longitude?: number;
  images: Image[];
}

// 3.6 / 3.7 — 欄位待確認（DATA_MODEL §7）
export interface InquiryItem {
  id: number;
  productId?: number; // 產品日後刪除時為空，靠快照顯示
  modelNoSnapshot: string;
  productNameSnapshot: LocalizedText;
  quantity: number;
}

export interface Inquiry {
  id: number;
  inquiryNo: string;
  contactName: string;
  companyName?: string;
  email: string;
  phone?: string;
  message?: string;
  locale: DataLocale;
  items: InquiryItem[];
  createdAt: string; // ISO 8601
}
