import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LampArt from "@/components/LampArt";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { Link } from "@/i18n/navigation";
import { PAGE_PHOTOS } from "@/data/page-photos";

// 各服務代表照片取自案例照片；S-03 訂製燈具用示意圖
const SERVICES = [
  { key: "s01", photo: PAGE_PHOTOS.facadeProjection },
  { key: "s02", photo: PAGE_PHOTOS.festival },
  { key: "s03", photo: null },
  { key: "s04", photo: PAGE_PHOTOS.bridgeWalkway },
  { key: "s05", photo: PAGE_PHOTOS.stoneAlley },
] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("services") };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations("Nav");
  const s = await getTranslations("Services");
  const t = await getTranslations("ServicesPage");

  return (
    <PageShell>
      <PageHeader title={nav("services")} label={`SERVICES / ${String(SERVICES.length).padStart(2, "0")}`} />
      <p className="mb-16 max-w-2xl text-lg text-muted">{t("intro")}</p>

      {/* 5 項服務：圖文左右交錯 */}
      <ol className="grid gap-16 min-[900px]:gap-24">
        {SERVICES.map(({ key, photo }, i) => (
          <li key={key} className="slide grid items-center gap-8 min-[900px]:grid-cols-2 min-[900px]:gap-14">
            <div
              className={`relative aspect-[3/2] overflow-hidden border border-ink ${i % 2 ? "min-[900px]:order-2" : ""}`}
            >
              {photo ? (
                <Image
                  src={photo.url}
                  alt={s(`${key}.title`)}
                  fill
                  sizes="(min-width: 900px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-surface p-[18%]">
                  <LampArt lightTypeId={2} />
                  <span className="label-mono absolute top-2 left-2.5 text-[11px]">CUSTOM LUMINAIRE</span>
                </div>
              )}
            </div>
            <div>
              <span className="font-mono text-sm">S-{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 border-b-2 border-ink pb-3 text-[clamp(22px,2.6vw,30px)] font-bold tracking-wide">
                {s(`${key}.title`)}
              </h2>
              <p className="mt-4 text-muted">{s(`${key}.desc`)}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-24 flex flex-wrap items-center justify-between gap-6 border-2 border-ink bg-brand p-8 text-[#1d1f22] min-[900px]:p-14">
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold">{t("ctaTitle")}</h2>
        <Link
          href="/contact"
          className="inline-flex border-[1.5px] border-[#1d1f22] bg-[#1d1f22] px-5.5 py-3 text-sm font-medium text-[#f3f3ef] hover:bg-transparent hover:text-[#1d1f22]"
        >
          {t("ctaButton")}
        </Link>
      </div>
    </PageShell>
  );
}
