-- 範例資料（產品、案例、詢價）：dev 與 demo profile 載入，正式環境不載入
-- 內容變更時 Flyway 會重跑本檔，已存在的列不覆蓋（ON DUPLICATE KEY 不更新）

INSERT INTO product (id, slug, model_no, name_zh, name_en, wattage, color_temperature, dimensions, ip_rating, price, price_visible) VALUES
    (1, 'lf-dl-090', 'LF-DL-090', '防眩深藏嵌燈 90', 'Deep Anti-Glare Downlight 90', '9W / 12W', '2700K / 3000K / 4000K', 'Ø90 × H110 mm', 'IP20', 1280, TRUE),
    (2, 'lf-dl-150', 'LF-DL-150', '高演色筒燈 150', 'High-CRI Downlight 150', '18W / 24W', '3000K / 4000K', 'Ø150 × H95 mm', 'IP44', 2150, TRUE),
    (3, 'lf-fl-120', 'LF-FL-120', '建築洗牆投光燈', 'Architectural Wall-Wash Floodlight', '60W / 120W', '2700K / 3000K / RGBW', 'L320 × W210 × H95 mm', 'IP66', NULL, FALSE),
    (4, 'lf-fl-gobo', 'LF-FL-GOBO', 'GOBO 圖案投影燈', 'GOBO Pattern Projector', '50W', '3000K', 'L260 × Ø110 mm', 'IP65', NULL, FALSE),
    (5, 'lf-ln-al25', 'LF-LN-AL25', '鋁槽線性燈 25', 'Aluminum Channel Linear Light 25', '10W/m', '2700K / 3000K / 4000K', 'W25 × H35 mm', 'IP67', 980, TRUE),
    (6, 'lf-ln-pixel', 'LF-LN-PIXEL', '幻彩像素燈管', 'Pixel Tube', '18W/m', 'RGB', 'Ø30 × L1000 mm', 'IP65', NULL, FALSE),
    (7, 'lf-pd-ring', 'LF-PD-RING', '環形大廳吊燈', 'Ring Lobby Pendant', '48W / 96W', '3000K', 'Ø800 / Ø1200 mm', 'IP20', NULL, FALSE),
    (8, 'lf-pd-mini', 'LF-PD-MINI', '極簡單頭吊燈', 'Minimal Single Pendant', '8W', '2700K / 3000K', 'Ø60 × H200 mm', 'IP20', 1680, TRUE)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_category (product_id, category_id) VALUES
    (1, 1),
    (1, 5),
    (1, 6),
    (2, 1),
    (2, 6),
    (2, 8),
    (3, 2),
    (3, 7),
    (3, 8),
    (4, 2),
    (4, 7),
    (4, 6),
    (5, 3),
    (5, 5),
    (5, 6),
    (5, 7),
    (6, 3),
    (6, 7),
    (7, 4),
    (7, 6),
    (7, 8),
    (8, 4),
    (8, 5)
ON DUPLICATE KEY UPDATE product_id = product_id;

INSERT INTO product_image (id, product_id, kind, url, sort_order) VALUES
    (1, 1, 'PRODUCT', '/mock/products/lf-dl-090/product-1.jpg', 1),
    (2, 1, 'PRODUCT', '/mock/products/lf-dl-090/product-2.jpg', 2),
    (3, 1, 'PRODUCT', '/mock/products/lf-dl-090/product-3.jpg', 3),
    (4, 1, 'APPLICATION', '/mock/products/lf-dl-090/application-1.jpg', 1),
    (5, 1, 'APPLICATION', '/mock/products/lf-dl-090/application-2.jpg', 2),
    (6, 2, 'PRODUCT', '/mock/products/lf-dl-150/product-1.jpg', 1),
    (7, 2, 'PRODUCT', '/mock/products/lf-dl-150/product-2.jpg', 2),
    (8, 2, 'APPLICATION', '/mock/products/lf-dl-150/application-1.jpg', 1),
    (9, 3, 'PRODUCT', '/mock/products/lf-fl-120/product-1.jpg', 1),
    (10, 3, 'PRODUCT', '/mock/products/lf-fl-120/product-2.jpg', 2),
    (11, 3, 'PRODUCT', '/mock/products/lf-fl-120/product-3.jpg', 3),
    (12, 3, 'APPLICATION', '/mock/products/lf-fl-120/application-1.jpg', 1),
    (13, 3, 'APPLICATION', '/mock/products/lf-fl-120/application-2.jpg', 2),
    (14, 3, 'APPLICATION', '/mock/products/lf-fl-120/application-3.jpg', 3),
    (15, 4, 'PRODUCT', '/mock/products/lf-fl-gobo/product-1.jpg', 1),
    (16, 4, 'PRODUCT', '/mock/products/lf-fl-gobo/product-2.jpg', 2),
    (17, 4, 'APPLICATION', '/mock/products/lf-fl-gobo/application-1.jpg', 1),
    (18, 4, 'APPLICATION', '/mock/products/lf-fl-gobo/application-2.jpg', 2),
    (19, 5, 'PRODUCT', '/mock/products/lf-ln-al25/product-1.jpg', 1),
    (20, 5, 'PRODUCT', '/mock/products/lf-ln-al25/product-2.jpg', 2),
    (21, 5, 'APPLICATION', '/mock/products/lf-ln-al25/application-1.jpg', 1),
    (22, 5, 'APPLICATION', '/mock/products/lf-ln-al25/application-2.jpg', 2),
    (23, 6, 'PRODUCT', '/mock/products/lf-ln-pixel/product-1.jpg', 1),
    (24, 6, 'PRODUCT', '/mock/products/lf-ln-pixel/product-2.jpg', 2),
    (25, 6, 'APPLICATION', '/mock/products/lf-ln-pixel/application-1.jpg', 1),
    (26, 7, 'PRODUCT', '/mock/products/lf-pd-ring/product-1.jpg', 1),
    (27, 7, 'PRODUCT', '/mock/products/lf-pd-ring/product-2.jpg', 2),
    (28, 7, 'PRODUCT', '/mock/products/lf-pd-ring/product-3.jpg', 3),
    (29, 7, 'APPLICATION', '/mock/products/lf-pd-ring/application-1.jpg', 1),
    (30, 7, 'APPLICATION', '/mock/products/lf-pd-ring/application-2.jpg', 2),
    (31, 8, 'PRODUCT', '/mock/products/lf-pd-mini/product-1.jpg', 1),
    (32, 8, 'PRODUCT', '/mock/products/lf-pd-mini/product-2.jpg', 2)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_file (id, product_id, kind, url, file_name, size_bytes) VALUES
    (1, 1, 'CATALOG_PDF', '/mock/files/lf-dl-090.pdf', 'LF-DL-090_catalog.pdf', 2400000),
    (2, 1, 'IES', '/mock/files/lf-dl-090.ies', 'LF-DL-090.ies', 12000),
    (3, 1, 'CAD', '/mock/files/lf-dl-090.dwg', 'LF-DL-090.dwg', 380000),
    (4, 2, 'CATALOG_PDF', '/mock/files/lf-dl-150.pdf', 'LF-DL-150_catalog.pdf', 2400000),
    (5, 2, 'IES', '/mock/files/lf-dl-150.ies', 'LF-DL-150.ies', 12000),
    (6, 2, 'CAD', '/mock/files/lf-dl-150.dwg', 'LF-DL-150.dwg', 380000),
    (7, 3, 'CATALOG_PDF', '/mock/files/lf-fl-120.pdf', 'LF-FL-120_catalog.pdf', 2400000),
    (8, 3, 'IES', '/mock/files/lf-fl-120.ies', 'LF-FL-120.ies', 12000),
    (9, 3, 'CAD', '/mock/files/lf-fl-120.dwg', 'LF-FL-120.dwg', 380000),
    (10, 4, 'CATALOG_PDF', '/mock/files/lf-fl-gobo.pdf', 'LF-FL-GOBO_catalog.pdf', 2400000),
    (11, 4, 'IES', '/mock/files/lf-fl-gobo.ies', 'LF-FL-GOBO.ies', 12000),
    (12, 4, 'CAD', '/mock/files/lf-fl-gobo.dwg', 'LF-FL-GOBO.dwg', 380000),
    (13, 5, 'CATALOG_PDF', '/mock/files/lf-ln-al25.pdf', 'LF-LN-AL25_catalog.pdf', 2400000),
    (14, 5, 'IES', '/mock/files/lf-ln-al25.ies', 'LF-LN-AL25.ies', 12000),
    (15, 5, 'CAD', '/mock/files/lf-ln-al25.dwg', 'LF-LN-AL25.dwg', 380000),
    (16, 6, 'CATALOG_PDF', '/mock/files/lf-ln-pixel.pdf', 'LF-LN-PIXEL_catalog.pdf', 2400000),
    (17, 6, 'IES', '/mock/files/lf-ln-pixel.ies', 'LF-LN-PIXEL.ies', 12000),
    (18, 6, 'CAD', '/mock/files/lf-ln-pixel.dwg', 'LF-LN-PIXEL.dwg', 380000),
    (19, 7, 'CATALOG_PDF', '/mock/files/lf-pd-ring.pdf', 'LF-PD-RING_catalog.pdf', 2400000),
    (20, 7, 'IES', '/mock/files/lf-pd-ring.ies', 'LF-PD-RING.ies', 12000),
    (21, 7, 'CAD', '/mock/files/lf-pd-ring.dwg', 'LF-PD-RING.dwg', 380000),
    (22, 8, 'CATALOG_PDF', '/mock/files/lf-pd-mini.pdf', 'LF-PD-MINI_catalog.pdf', 2400000),
    (23, 8, 'IES', '/mock/files/lf-pd-mini.ies', 'LF-PD-MINI.ies', 12000),
    (24, 8, 'CAD', '/mock/files/lf-pd-mini.dwg', 'LF-PD-MINI.dwg', 380000)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO project (id, slug, title_zh, title_en, description_zh, description_en, year, location_zh, location_en, county_code, latitude, longitude) VALUES
    (1, 'riverside-footbridge-2026', '2026 河濱人行橋夜間照明', '2026 Riverside Footbridge Night Lighting', '為一座約 300 公尺的跨河人行橋規劃夜間照明並承造。沿欄杆佈設低眩光線性燈帶引導動線，橋下以 2700K 洗牆凸顯鋼構，並以遮光罩控制朝水面溢散的光，兼顧行人安全與河岸生態。', 'Night lighting design and installation for a 300 m pedestrian bridge. Low-glare linear lighting along the handrails guides walkers, 2700K wall-washing reveals the steel structure from below, and shielding keeps spill light off the water to protect the riverbank habitat.', 2026, '嘉義縣', 'Chiayi County', 'TW-CYQ', 23.565, 120.302),
    (2, 'harbor-light-festival-2024', '2024 港灣光影節主燈區', '2024 Harbor Light Festival — Main Zone', '港灣光影節主燈區燈光策展：以投光燈與像素燈管串起水岸動線，主燈每 15 分鐘一場光影秀。', 'Lighting curation for the main zone of a harbor light festival: floodlights and pixel tubes link the waterfront route, with a light show on the main installation every 15 minutes.', 2024, '臺南市', 'Tainan', 'TW-TNN', NULL, NULL),
    (3, 'hillside-lantern-trail-2022', '2022 山城燈徑', '2022 Hillside Lantern Trail', '山坡步道燈節的燈光策展與現場調光，沿步道設置低照度引導燈與裝置藝術照明。', 'Lighting curation and on-site aiming for a hillside trail festival, with low-level wayfinding lights and installation lighting along the path.', 2022, '高雄市', 'Kaohsiung', 'TW-KHH', NULL, NULL)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO project_category (project_id, category_id) VALUES
    (1, 12),
    (1, 10),
    (2, 9),
    (3, 9)
ON DUPLICATE KEY UPDATE project_id = project_id;

INSERT INTO project_image (id, project_id, url, sort_order) VALUES
    (1, 1, '/demo/projects/riverside-footbridge-2026-1.jpg', 1),
    (2, 1, '/demo/projects/riverside-footbridge-2026-2.jpg', 2),
    (3, 1, '/demo/projects/riverside-footbridge-2026-3.jpg', 3),
    (4, 2, '/demo/projects/harbor-light-festival-2024-1.jpg', 1),
    (5, 2, '/demo/projects/harbor-light-festival-2024-2.jpg', 2),
    (6, 2, '/demo/projects/harbor-light-festival-2024-3.jpg', 3),
    (7, 3, '/demo/projects/hillside-lantern-trail-2022-1.jpg', 1),
    (8, 3, '/demo/projects/hillside-lantern-trail-2022-2.jpg', 2),
    (9, 3, '/demo/projects/hillside-lantern-trail-2022-3.jpg', 3)
ON DUPLICATE KEY UPDATE id = id;

-- 時間以 UTC 儲存（spring.jpa.properties.hibernate.jdbc.time_zone=UTC）
INSERT INTO inquiry (id, inquiry_no, contact_name, company_name, email, phone, message, locale, created_at, updated_at) VALUES
    (1, 'INQ-20261020-0001', '王小明', '明亮室內設計有限公司', 'wang@example.com', '0912-345-678', '台中住宅案，客廳與走道使用，預計 12 月施工，請提供報價與交期。', 'zh', '2026-10-20 01:42:00.000', '2026-10-20 01:42:00.000'),
    (2, 'INQ-20261024-0001', 'Emily Chen', 'Lumen Studio Pte. Ltd.', 'emily@example.com', '+65 6123 4567', 'Hotel lobby project in Singapore. Do you ship overseas? Please send IES files and lead time for the ring pendant.', 'en', '2026-10-24 08:05:00.000', '2026-10-24 08:05:00.000'),
    (3, 'INQ-20261029-0001', '林先生', NULL, 'lin@example.com', NULL, NULL, 'zh', '2026-10-29 13:17:00.000', '2026-10-29 13:17:00.000'),
    (4, 'INQ-20261101-0001', '張雅婷', '南方景觀工程行', 'chang@example.com', '07-000-1234', '公園步道與水岸照明，需要投光燈與像素燈管，想約時間到現場勘查。', 'zh', '2026-11-01 02:30:00.000', '2026-11-01 02:30:00.000'),
    (5, 'INQ-20261102-0001', '陳志豪', '豪光水電行', 'hao@example.com', '0988-000-111', '舊型號還有庫存嗎？', 'zh', '2026-11-02 06:08:00.000', '2026-11-02 06:08:00.000'),
    (6, 'INQ-20261103-0001', 'Daniel Wu', NULL, 'daniel@example.com', NULL, NULL, 'en', '2026-11-03 00:51:00.000', '2026-11-03 00:51:00.000')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO inquiry_item (id, inquiry_id, product_id, model_no_snapshot, product_name_snapshot_zh, product_name_snapshot_en, quantity) VALUES
    (1, 1, 1, 'LF-DL-090', '防眩深藏嵌燈 90', 'Deep Anti-Glare Downlight 90', 24),
    (2, 1, 5, 'LF-LN-AL25', '鋁槽線性燈 25', 'Aluminum Channel Linear Light 25', 18),
    (3, 2, 7, 'LF-PD-RING', '環形大廳吊燈', 'Ring Lobby Pendant', 2),
    (4, 3, 8, 'LF-PD-MINI', '極簡單頭吊燈', 'Minimal Single Pendant', 3),
    (5, 4, 3, 'LF-FL-120', '建築洗牆投光燈', 'Architectural Wall-Wash Floodlight', 40),
    (6, 4, 6, 'LF-LN-PIXEL', '幻彩像素燈管', 'Pixel Tube', 120),
    (7, 4, 4, 'LF-FL-GOBO', 'GOBO 圖案投影燈', 'GOBO Pattern Projector', 6),
    (8, 5, NULL, 'LF-DL-075', '舊款嵌燈 75', 'Legacy Downlight 75', 10),
    (9, 5, 2, 'LF-DL-150', '高演色筒燈 150', 'High-CRI Downlight 150', 10),
    (10, 6, 1, 'LF-DL-090', '防眩深藏嵌燈 90', 'Deep Anti-Glare Downlight 90', 8)
ON DUPLICATE KEY UPDATE id = id;
