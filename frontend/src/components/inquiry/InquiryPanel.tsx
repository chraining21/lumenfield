"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useSyncExternalStore, useTransition } from "react";
import { submitInquiry } from "@/app/[locale]/inquiry/actions";
import LampArt from "@/components/LampArt";
import { Link } from "@/i18n/navigation";
import { DEMO_MODE } from "@/lib/demo";
import { clearCart, removeFromCart, setCartQty, useInquiryCart } from "@/lib/inquiry-cart";
import { localized, toDataLocale } from "@/lib/localized";
import { lightTypeOf } from "@/lib/product";
import type { Category, Product } from "@/types";

const noop = () => () => {};

export default function InquiryPanel({ products, categories }: { products: Product[]; categories: Category[] }) {
  const t = useTranslations("Inquiry");
  const locale = useLocale();
  const cart = useInquiryCart();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  ); // 讀到 localStorage 前不顯示「清單是空的」
  const [doneNo, setDoneNo] = useState<string | null>(null);
  const [failed, setFailed] = useState<false | "error" | "busy">(false);
  const [pending, startTransition] = useTransition();

  const items = cart.flatMap((c) => {
    const product = products.find((p) => p.slug === c.slug);
    return product ? [{ ...c, product }] : [];
  });

  if (doneNo) {
    return (
      <div className="border border-ink bg-surface p-10 min-[640px]:p-16">
        <p className="label-mono">{t("doneLabel")}</p>
        <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-bold tracking-wide">{t("doneTitle")}</h2>
        <p className="mt-6 label-mono">{t("doneNo")}</p>
        <p className="font-mono text-2xl font-medium">{doneNo}</p>
        <p className="mt-4 text-muted">{t("doneText")}</p>
        <Link
          href="/"
          className="mt-8 inline-flex border-[1.5px] border-ink bg-ink px-5.5 py-3 text-sm font-medium text-bg hover:border-brand hover:bg-brand hover:text-[#1d1f22]"
        >
          {t("backHome")} →
        </Link>
      </div>
    );
  }

  // 型號、名稱快照由後端依當下產品資料產生；這裡只送產品 id 與數量
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    setFailed(false);
    startTransition(async () => {
      const result = await submitInquiry({
        contactName: text("name"),
        companyName: text("company"),
        email: text("email"),
        phone: text("phone"),
        message: text("note"),
        locale: toDataLocale(locale),
        items: items.map((i) => ({ productId: i.product.id, quantity: i.qty })),
        website: text("website"),
      });
      if (result.ok) {
        setDoneNo(result.inquiryNo);
        clearCart();
      } else {
        setFailed(result.busy ? "busy" : "error");
      }
    });
  };

  const field =
    "w-full border border-ink bg-bg px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40";
  const label = (key: string, required = false) => (
    <span className="mb-1 block text-sm">
      {t(key)}
      {required && <span className="ml-1 font-mono text-xs text-muted">* {t("required")}</span>}
    </span>
  );

  return (
    <div className="grid gap-10 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <section>
        <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-2">
          <h2 className="font-bold tracking-wide">{t("items")}</h2>
          <span className="label-mono">ITEMS / {String(items.length).padStart(2, "0")}</span>
        </div>

        {!hydrated ? (
          <div className="h-40 border border-dashed border-line" />
        ) : items.length === 0 ? (
          <div className="border border-dashed border-muted p-10 text-center">
            <p className="text-muted">{t("empty")}</p>
            <Link href="/products" className="label-mono mt-3 inline-block hover:text-ink">
              {t("browse")}
            </Link>
          </div>
        ) : (
          <ul className="border border-ink bg-bg">
            {items.map(({ slug, qty, product }) => (
              <li
                key={slug}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-x-4 gap-y-3 border-t border-line p-3 first:border-t-0"
              >
                <div className="h-12 w-16 bg-surface p-1.5">
                  <LampArt lightTypeId={lightTypeOf(product, categories)} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[13px] text-muted">{product.modelNo}</p>
                  <Link href={`/products/${slug}`} className="hover:underline">
                    {localized(product.name, locale)}
                  </Link>
                </div>
                <div className="col-span-3 flex items-center justify-between gap-3 min-[640px]:col-span-1">
                  <div className="flex border border-ink font-mono text-sm">
                    <button type="button" onClick={() => setCartQty(slug, qty - 1)} className="px-2.5" aria-label="−1">
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      aria-label={`${product.modelNo} qty`}
                      onChange={(e) => setCartQty(slug, Number(e.target.value) || 1)}
                      className="w-12 [appearance:textfield] border-x border-ink bg-transparent text-center [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button type="button" onClick={() => setCartQty(slug, qty + 1)} className="px-2.5" aria-label="+1">
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(slug)}
                    className="font-mono text-xs text-muted hover:text-ink"
                  >
                    {t("remove")} ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* TODO: 表單欄位待確認（目前暫定姓名、公司、Email、電話、需求說明） */}
      <form
        onSubmit={submit}
        className="grid h-fit gap-4 border border-ink bg-surface p-6 min-[900px]:sticky min-[900px]:top-24"
      >
        <h2 className="border-b-2 border-ink pb-2 font-bold tracking-wide">{t("formTitle")}</h2>
        {DEMO_MODE && <p className="border border-brand bg-highlight p-3 text-sm">{t("demoNotice")}</p>}
        <label>
          {label("name", true)}
          <input name="name" required maxLength={100} autoComplete="name" className={field} />
        </label>
        <label>
          {label("company")}
          <input name="company" maxLength={200} autoComplete="organization" className={field} />
        </label>
        <label>
          {label("email", true)}
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
        </label>
        <label>
          {label("phone")}
          <input name="phone" type="tel" maxLength={50} autoComplete="tel" className={field} />
        </label>
        <label>
          {label("note")}
          <textarea name="note" rows={4} maxLength={5000} className={field} />
        </label>
        {/* honeypot：移出畫面、螢幕閱讀器與 Tab 鍵都跳過，真人不會填；機器人常把每個欄位都填上 */}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px opacity-0"
        />
        <button
          type="submit"
          disabled={items.length === 0 || pending}
          className="border-[1.5px] border-ink bg-ink px-5.5 py-3 text-sm font-medium text-bg transition-colors enabled:hover:border-brand enabled:hover:bg-brand enabled:hover:text-[#1d1f22] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? t("sending") : `${t("submit")} →`}
        </button>
        {hydrated && items.length === 0 && <p className="text-sm text-muted">{t("needItems")}</p>}
        {failed && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {t(failed === "busy" ? "submitBusy" : "submitError")}
          </p>
        )}
      </form>
    </div>
  );
}
