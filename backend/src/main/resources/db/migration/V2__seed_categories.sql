-- 分類（正式與開發都需要；後台沒有分類管理）
-- TODO: 燈型、空間的實際分類項目待確認（DATA_MODEL §7），確認後以新的 migration 修改

INSERT INTO category (id, type, slug, name_zh, name_en, sort_order) VALUES
    (1, 'LIGHT_TYPE', 'downlight', '嵌燈／筒燈', 'Downlights', 1),
    (2, 'LIGHT_TYPE', 'floodlight', '投光燈', 'Floodlights', 2),
    (3, 'LIGHT_TYPE', 'linear', '線性燈', 'Linear Lights', 3),
    (4, 'LIGHT_TYPE', 'pendant', '吊燈', 'Pendants', 4),
    (5, 'SPACE', 'residential', '住宅', 'Residential', 1),
    (6, 'SPACE', 'commercial', '商業空間', 'Commercial', 2),
    (7, 'SPACE', 'landscape', '戶外景觀', 'Landscape', 3),
    (8, 'SPACE', 'public', '公共建築', 'Public Buildings', 4),
    (9, 'PROJECT', 'festival', '燈節與光影策展', 'Lantern Festivals & Light Curation', 1),
    (10, 'PROJECT', 'public-art', '公共藝術與地景', 'Public Art & Landscape', 2),
    (11, 'PROJECT', 'streetscape', '街區營造與造街', 'Streetscape & Placemaking', 3),
    (12, 'PROJECT', 'heritage', '歷史古蹟與宮廟', 'Heritage Sites & Temples', 4),
    (13, 'PROJECT', 'commercial-campus', '商業空間與校園', 'Commercial & Campus', 5),
    (14, 'PROJECT', 'other', '其他照明專案', 'Other Lighting Projects', 6)
ON DUPLICATE KEY UPDATE id = id;
