// 產生縣市地圖 SVG 資料：node scripts/build-taiwan-map.mjs
// 來源：taiwan-atlas（內政部縣市界線開放資料，TopoJSON）
// 輸出：src/data/taiwan-map.ts（已 commit，平常不用重跑）
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { presimplify, quantile, simplify } from "topojson-simplify";

const require = createRequire(import.meta.url);
// 簡化線條：只保留最重要的 8% 頂點，縣市交界仍然吻合（TopoJSON 共用邊）
const topo = (() => {
  const t = presimplify(require("taiwan-atlas/counties-10t.json"));
  return simplify(t, quantile(t, 0.08));
})();

const W = 400;
const H = 560;
const PAD = 16;

// 內政部縣市名稱 → ISO 3166-2:TW
const ISO = {
  基隆市: "TW-KEE", 臺北市: "TW-TPE", 新北市: "TW-NWT", 桃園市: "TW-TAO", 新竹市: "TW-HSZ", 新竹縣: "TW-HSQ",
  苗栗縣: "TW-MIA", 臺中市: "TW-TXG", 彰化縣: "TW-CHA", 南投縣: "TW-NAN", 雲林縣: "TW-YUN", 嘉義市: "TW-CYI",
  嘉義縣: "TW-CYQ", 臺南市: "TW-TNN", 高雄市: "TW-KHH", 屏東縣: "TW-PIF", 宜蘭縣: "TW-ILA", 花蓮縣: "TW-HUA",
  臺東縣: "TW-TTT", 澎湖縣: "TW-PEN", 金門縣: "TW-KIN", 連江縣: "TW-LIE",
};
// 金門、連江離本島太遠，放左上角小框
const INSETS = {
  "TW-LIE": [PAD, PAD, 96, 72],
  "TW-KIN": [PAD, PAD + 88, 96, 72],
};

const all = feature(topo, topo.objects.counties).features;
const main = { type: "FeatureCollection", features: all.filter((f) => !INSETS[ISO[f.properties.COUNTYNAME.replace(/台/g, "臺")]]) };
const projection = geoMercator().fitExtent([[PAD + 100, PAD], [W - PAD, H - PAD]], main);
const round = (s) => s.replace(/\d+\.\d+/g, (n) => (+n).toFixed(1));

const MIN_AREA = 1.5;
const counties = all.map((f) => {
  const zh = f.properties.COUNTYNAME.replace(/台/g, "臺"); // 資料混用台／臺，統一成臺
  const code = ISO[zh];
  if (!code) throw new Error(`unknown county ${zh}`);
  let proj = projection;
  if (INSETS[code]) {
    const [x, y, w, h] = INSETS[code];
    proj = geoMercator().fitExtent([[x + 8, y + 8], [x + w - 8, y + h - 8]], f);
  }
  const path = geoPath(proj);
  // 去掉投影後面積小於 MIN_AREA 的小島，避免路徑資料過大
  if (f.geometry.type === "MultiPolygon") {
    const polys = f.geometry.coordinates.filter((c) => path.area({ type: "Polygon", coordinates: c }) >= MIN_AREA);
    f = { ...f, geometry: { type: "MultiPolygon", coordinates: polys } };
  }
  const [cx, cy] = path.centroid(f).map((v) => Math.round(v));
  return { code, name: { zh, en: f.properties.COUNTYENG }, d: round(path(f)), cx, cy };
});
counties.sort((a, b) => a.code.localeCompare(b.code));

// 本島與澎湖的投影參數，執行時把經緯度換成座標（畫光點用）
const k = projection.scale();
const [tx, ty] = projection.translate();

const out = `// 由 scripts/build-taiwan-map.mjs 產生，請勿手動修改
// 資料來源：內政部縣市界線（taiwan-atlas, MIT）
import type { CountyCode, LocalizedText } from "@/types";

export const MAP_SIZE = { width: ${W}, height: ${H} };
export const MAP_INSETS = ${JSON.stringify(Object.entries(INSETS).map(([code, [x, y, w, h]]) => ({ code, x, y, w, h })))} as const;

// geoMercator：x = tx + k·λ，y = ty − k·ln(tan(π/4 + φ/2))（λ、φ 為弧度）
const K = ${k};
const TX = ${tx};
const TY = ${ty};
export function project(lng: number, lat: number): [number, number] {
  const l = (lng * Math.PI) / 180;
  const p = (lat * Math.PI) / 180;
  return [TX + K * l, TY - K * Math.log(Math.tan(Math.PI / 4 + p / 2))];
}

export type CountyShape = { code: CountyCode; name: LocalizedText; d: string; cx: number; cy: number };

export const COUNTIES: CountyShape[] = ${JSON.stringify(counties, null, 1)};
`;
writeFileSync(new URL("../src/data/taiwan-map.ts", import.meta.url), out);
console.log(`counties: ${counties.length}, bytes: ${out.length}`);
