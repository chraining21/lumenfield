// 公司基本資料；頁尾、關於、聯絡共用。LUMENFIELD 是虛構品牌，電話與 Email 都不會通
export const COMPANY = {
  phone: "02-0000-0000",
  fax: "02-0000-0001",
  email: "hello@lumenfield.example",
};

export const telHref = (phone: string) => `tel:${phone.replace(/\D/g, "")}`;
