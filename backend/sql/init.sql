DROP DATABASE IF EXISTS mall_builder;

CREATE DATABASE mall_builder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mall_builder;

-- ─── 用户表 ───────────────────────────────────────────────────
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  avatar      VARCHAR(500) DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 项目表 ───────────────────────────────────────────────────
-- navbar_config JSON: { activeColor, items: [{ icon, label, pageType }] }
-- pageType: 'mall' | 'orders' | 'custom'，preview 运行时解析为实际 pageId
CREATE TABLE projects (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL,
  name            VARCHAR(100) NOT NULL DEFAULT 'My Mall',
  description     VARCHAR(500) DEFAULT NULL,
  navbar_config   LONGTEXT DEFAULT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 页面表 ───────────────────────────────────────────────────
-- page_type: mall=商品页 checkout=支付页 orders=订单页 custom=用户自建
-- is_default: 1=模板锁定页，不可删除
CREATE TABLE pages (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  project_id    INT NOT NULL,
  user_id       INT NOT NULL,
  title         VARCHAR(100) NOT NULL DEFAULT 'Untitled',
  cover         VARCHAR(500) DEFAULT NULL,
  config        LONGTEXT NOT NULL,
  page_type     ENUM('mall','checkout','orders','custom') NOT NULL DEFAULT 'custom',
  is_default    TINYINT NOT NULL DEFAULT 0,
  status        TINYINT NOT NULL DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_user_id    (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 订单表 ───────────────────────────────────────────────────
CREATE TABLE orders (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  page_id              INT DEFAULT NULL,
  items                LONGTEXT NOT NULL,
  total_price          DECIMAL(10,2) NOT NULL DEFAULT 0,
  pickup_number        VARCHAR(6)  NOT NULL,
  payment_status       ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  alipay_out_trade_no  VARCHAR(64) DEFAULT NULL,
  alipay_trade_no      VARCHAR(64) DEFAULT NULL,
  status               TINYINT NOT NULL DEFAULT 1,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pickup          (pickup_number),
  INDEX idx_page_id         (page_id),
  INDEX idx_out_trade_no    (alipay_out_trade_no),
  INDEX idx_created_at      (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 测试账号 ─────────────────────────────────────────────────
-- admin@test.com / 123456
INSERT INTO users (username, email, password) VALUES
  ('admin', 'admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
