-- 開發用管理者：只在 dev profile 載入，密碼見 backend/README.md
INSERT INTO admin_user (id, username, password_hash) VALUES
    (1, 'admin', '$2a$10$5WJ31Q0seawagz8UbAwRQOyVrrBmxzf9q5W9YEca6v1CsfSpg9Vyy')
ON DUPLICATE KEY UPDATE id = id;
