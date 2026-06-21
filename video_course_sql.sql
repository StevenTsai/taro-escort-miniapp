-- 视频录播功能数据表SQL
-- 基于视频录播功能数据表设计文档生成

-- 创建数据库（如果需要）
-- CREATE DATABASE IF NOT EXISTS medical_chaperon DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE medical_chaperon;

-- 1. 课程分类表（course_categories）
CREATE TABLE IF NOT EXISTS `course_categories` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '分类ID',
  `name` VARCHAR(255) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(512) COMMENT '分类图标URL',
  `course_count` INT DEFAULT 0 COMMENT '该分类下的课程数量',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程分类表';

-- 2. 讲师表（teachers）
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '讲师ID',
  `name` VARCHAR(255) NOT NULL COMMENT '讲师姓名',
  `avatar` VARCHAR(512) COMMENT '讲师头像URL',
  `title` VARCHAR(255) COMMENT '讲师头衔',
  `hospital` VARCHAR(255) COMMENT '所属医院',
  `bio` TEXT COMMENT '讲师简介',
  `course_count` INT DEFAULT 0 COMMENT '讲师课程数量',
  `student_count` INT DEFAULT 0 COMMENT '讲师学生数量',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讲师表';

-- 3. 课程表（courses）
CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '课程ID',
  `title` VARCHAR(255) NOT NULL COMMENT '课程标题',
  `description` TEXT COMMENT '课程描述',
  `cover_image` VARCHAR(512) COMMENT '课程封面图URL',
  `teacher_id` VARCHAR(36) NOT NULL COMMENT '讲师ID',
  `category_id` VARCHAR(36) NOT NULL COMMENT '分类ID',
  `type` ENUM('free', 'paid', 'member') NOT NULL DEFAULT 'free' COMMENT '课程类型：free(免费), paid(付费), member(会员)',
  `price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '课程价格',
  `original_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '课程原价',
  `duration` INT DEFAULT 0 COMMENT '课程总时长（秒）',
  `video_count` INT DEFAULT 0 COMMENT '视频数量',
  `view_count` INT DEFAULT 0 COMMENT '观看次数',
  `favorite_count` INT DEFAULT 0 COMMENT '收藏次数',
  `rating` DECIMAL(3,1) DEFAULT 0.0 COMMENT '课程评分',
  `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft' COMMENT '课程状态：published(已发布), draft(草稿)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  -- 外键约束
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `course_categories`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- 4. 视频表（videos）
CREATE TABLE IF NOT EXISTS `videos` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '视频ID',
  `course_id` VARCHAR(36) NOT NULL COMMENT '所属课程ID',
  `title` VARCHAR(255) NOT NULL COMMENT '视频标题',
  `description` TEXT COMMENT '视频描述',
  `duration` INT DEFAULT 0 COMMENT '视频时长（秒）',
  `play_url` VARCHAR(512) NOT NULL COMMENT '视频播放地址URL',
  `cover_image` VARCHAR(512) COMMENT '视频封面图URL',
  `order` INT DEFAULT 0 COMMENT '视频顺序',
  `is_free` TINYINT(1) DEFAULT 0 COMMENT '是否免费（0: 不免费, 1: 免费）',
  `view_count` INT DEFAULT 0 COMMENT '观看次数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  -- 外键约束
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频表';

-- 5. 用户购买课程表（user_courses）
CREATE TABLE IF NOT EXISTS `user_courses` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户ID',
  `course_id` VARCHAR(36) NOT NULL COMMENT '课程ID',
  `purchase_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '购买时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  -- 唯一约束，确保用户不会重复购买同一课程
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
  -- 外键约束
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户购买课程表';

-- 6. 用户收藏课程表（user_favorites）
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户ID',
  `course_id` VARCHAR(36) NOT NULL COMMENT '课程ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  -- 唯一约束，确保用户不会重复收藏同一课程
  UNIQUE KEY `uk_user_favorite` (`user_id`, `course_id`),
  -- 外键约束
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏课程表';

-- 7. 观看历史表（watch_history）
CREATE TABLE IF NOT EXISTS `watch_history` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT '历史记录ID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户ID',
  `course_id` VARCHAR(36) NOT NULL COMMENT '课程ID',
  `video_id` VARCHAR(36) NOT NULL COMMENT '视频ID',
  `progress` INT DEFAULT 0 COMMENT '观看进度（秒）',
  `watched_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '观看时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  -- 外键约束
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`),
  FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='观看历史表';

-- 创建索引以提高查询性能
-- 课程表索引
CREATE INDEX `idx_courses_teacher_id` ON `courses`(`teacher_id`);
CREATE INDEX `idx_courses_category_id` ON `courses`(`category_id`);
CREATE INDEX `idx_courses_type` ON `courses`(`type`);
CREATE INDEX `idx_courses_status` ON `courses`(`status`);

-- 视频表索引
CREATE INDEX `idx_videos_course_id` ON `videos`(`course_id`);
CREATE INDEX `idx_videos_order` ON `videos`(`order`);

-- 用户购买课程表索引
CREATE INDEX `idx_user_courses_user_id` ON `user_courses`(`user_id`);
CREATE INDEX `idx_user_courses_course_id` ON `user_courses`(`course_id`);

-- 用户收藏课程表索引
CREATE INDEX `idx_user_favorites_user_id` ON `user_favorites`(`user_id`);
CREATE INDEX `idx_user_favorites_course_id` ON `user_favorites`(`course_id`);

-- 观看历史表索引
CREATE INDEX `idx_watch_history_user_id` ON `watch_history`(`user_id`);
CREATE INDEX `idx_watch_history_course_id` ON `watch_history`(`course_id`);
CREATE INDEX `idx_watch_history_video_id` ON `watch_history`(`video_id`);
CREATE INDEX `idx_watch_history_watched_at` ON `watch_history`(`watched_at`);
