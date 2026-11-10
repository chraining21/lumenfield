-- 依 docs/DATA_MODEL.md v0.1 建立全部資料表
-- 雙語欄位（LocalizedText）展開為 _zh / _en 兩欄；列舉以 VARCHAR + CHECK 儲存

CREATE TABLE category (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    type        VARCHAR(20)  NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    name_zh     VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100) NOT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_category_type_slug UNIQUE (type, slug),
    CONSTRAINT ck_category_type CHECK (type IN ('LIGHT_TYPE', 'SPACE', 'PROJECT'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE product (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    slug               VARCHAR(100)  NOT NULL,
    model_no           VARCHAR(50)   NOT NULL,
    name_zh            VARCHAR(200)  NOT NULL,
    name_en            VARCHAR(200)  NOT NULL,
    wattage            VARCHAR(100),
    color_temperature  VARCHAR(100),
    dimensions         VARCHAR(100),
    ip_rating          VARCHAR(20),
    price              DECIMAL(12, 2),
    price_visible      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_product_slug UNIQUE (slug),
    CONSTRAINT uk_product_model_no UNIQUE (model_no),
    CONSTRAINT ck_product_price CHECK (price IS NULL OR price >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE product_category (
    product_id   BIGINT NOT NULL,
    category_id  BIGINT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_product_category_product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_category_category FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- kind：PRODUCT（產品圖）／APPLICATION（應用照片），sort_order 為同一 kind 內的順序
CREATE TABLE product_image (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    product_id  BIGINT         NOT NULL,
    kind        VARCHAR(20)    NOT NULL,
    url         VARCHAR(1000)  NOT NULL,
    alt_zh      VARCHAR(300),
    alt_en      VARCHAR(300),
    sort_order  INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_image_product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE,
    CONSTRAINT ck_product_image_kind CHECK (kind IN ('PRODUCT', 'APPLICATION')),
    INDEX ix_product_image_order (product_id, kind, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE product_file (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    product_id  BIGINT         NOT NULL,
    kind        VARCHAR(20)    NOT NULL,
    url         VARCHAR(1000)  NOT NULL,
    file_name   VARCHAR(255)   NOT NULL,
    size_bytes  BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_file_product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE,
    CONSTRAINT ck_product_file_kind CHECK (kind IN ('CATALOG_PDF', 'IES', 'CAD'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(150)  NOT NULL,
    title_zh        VARCHAR(200)  NOT NULL,
    title_en        VARCHAR(200)  NOT NULL,
    description_zh  TEXT,
    description_en  TEXT,
    year            INT           NOT NULL,
    location_zh     VARCHAR(200)  NOT NULL,
    location_en     VARCHAR(200)  NOT NULL,
    county_code     VARCHAR(6)    NOT NULL,
    latitude        DECIMAL(9, 6),
    longitude       DECIMAL(9, 6),
    created_at      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_project_slug UNIQUE (slug),
    CONSTRAINT ck_project_county CHECK (county_code IN (
        'TW-KEE', 'TW-TPE', 'TW-NWT', 'TW-TAO', 'TW-HSZ', 'TW-HSQ', 'TW-MIA', 'TW-TXG',
        'TW-CHA', 'TW-NAN', 'TW-YUN', 'TW-CYI', 'TW-CYQ', 'TW-TNN', 'TW-KHH', 'TW-PIF',
        'TW-ILA', 'TW-HUA', 'TW-TTT', 'TW-PEN', 'TW-KIN', 'TW-LIE')),
    -- 經緯度要一起填或一起空
    CONSTRAINT ck_project_coordinates CHECK ((latitude IS NULL) = (longitude IS NULL))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project_category (
    project_id   BIGINT NOT NULL,
    category_id  BIGINT NOT NULL,
    PRIMARY KEY (project_id, category_id),
    CONSTRAINT fk_project_category_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    CONSTRAINT fk_project_category_category FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project_image (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    project_id  BIGINT         NOT NULL,
    url         VARCHAR(1000)  NOT NULL,
    alt_zh      VARCHAR(300),
    alt_en      VARCHAR(300),
    sort_order  INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_project_image_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    INDEX ix_project_image_order (project_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- TODO: 聯絡欄位待確認（DATA_MODEL §7）
CREATE TABLE inquiry (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    inquiry_no    VARCHAR(30)   NOT NULL,
    contact_name  VARCHAR(100)  NOT NULL,
    company_name  VARCHAR(200),
    email         VARCHAR(254)  NOT NULL,
    phone         VARCHAR(50),
    message       TEXT,
    locale        VARCHAR(2)    NOT NULL,
    created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_inquiry_no UNIQUE (inquiry_no),
    CONSTRAINT ck_inquiry_locale CHECK (locale IN ('zh', 'en')),
    INDEX ix_inquiry_created (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 型號與名稱為送出當下的快照；產品日後刪除時 product_id 變成 NULL，詢價紀錄保留
CREATE TABLE inquiry_item (
    id                        BIGINT        NOT NULL AUTO_INCREMENT,
    inquiry_id                BIGINT        NOT NULL,
    product_id                BIGINT,
    model_no_snapshot         VARCHAR(50)   NOT NULL,
    product_name_snapshot_zh  VARCHAR(200)  NOT NULL,
    product_name_snapshot_en  VARCHAR(200)  NOT NULL,
    quantity                  INT           NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_inquiry_item_inquiry FOREIGN KEY (inquiry_id) REFERENCES inquiry (id) ON DELETE CASCADE,
    CONSTRAINT fk_inquiry_item_product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE SET NULL,
    CONSTRAINT ck_inquiry_item_quantity CHECK (quantity >= 1)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 密碼只存 BCrypt 雜湊
CREATE TABLE admin_user (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    username       VARCHAR(50)   NOT NULL,
    password_hash  VARCHAR(100)  NOT NULL,
    created_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_admin_user_username UNIQUE (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
