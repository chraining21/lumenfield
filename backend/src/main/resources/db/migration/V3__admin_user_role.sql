-- 管理者角色：ADMIN 可讀寫；VIEWER 只能看（公開 demo 帳號用）
ALTER TABLE admin_user ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'ADMIN' AFTER password_hash;
