-- 经期管理联调用种子数据
-- 适用数据库：MySQL 8.x
-- 默认用户：user_id = 4
-- 生成范围：2026-01-19 到 2026-05-28，共 131 条 menstrual_record 主记录，
-- 同时为每条主记录生成 2 条 menstrual_record_item 明细。
--
-- 说明：
-- 1. 后端 /menstrual/predict 只读取 menstrual_record 中 cycle_phase = 1 的记录。
-- 2. 后端当前 MIN_CYCLES_FOR_PREDICTION = 3，本脚本会生成 5 个经期开始日：
--    2026-01-19、2026-02-16、2026-03-16、2026-04-13、2026-05-11。
-- 3. 脚本使用 ON DUPLICATE KEY UPDATE，重复执行不会新增同一天主记录。
-- 4. 为保证明细一致，脚本会删除这些日期对应主记录下的旧 menstrual_record_item，再重建。

USE ec_content;

-- 补足黄体期方案。你已有 id=10，这里补两条，避免 phase=4 日详情只有一条推荐。
INSERT INTO menstrual_health_plan
    (id, cycle_phase, plan_name, plan_content, sort_order, status, created_at, updated_at, deleted_at)
VALUES
    (11, 4, '情绪安稳', '黄体期易有情绪波动，建议减少咖啡因，保持充足睡眠与稳定节奏。', 2, 1, NOW(), NOW(), NULL),
    (12, 4, '温和代谢', '可选择散步、拉伸等温和运动，饮食少甜腻，帮助减轻水肿和疲乏。', 3, 1, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE
    cycle_phase = VALUES(cycle_phase),
    plan_name = VALUES(plan_name),
    plan_content = VALUES(plan_content),
    sort_order = VALUES(sort_order),
    status = VALUES(status),
    updated_at = NOW(),
    deleted_at = NULL;

DROP PROCEDURE IF EXISTS seed_menstrual_records_user4;

DELIMITER $$

CREATE PROCEDURE seed_menstrual_records_user4()
BEGIN
    DECLARE v_user_id BIGINT DEFAULT 4;
    DECLARE v_start_date DATE DEFAULT '2026-01-19';
    DECLARE v_end_date DATE DEFAULT '2026-05-28';
    DECLARE v_date DATE;
    DECLARE v_day_in_cycle INT;
    DECLARE v_cycle_phase INT;
    DECLARE v_body_status INT;
    DECLARE v_pain_level INT;
    DECLARE v_record_id BIGINT;

    SET v_date = v_start_date;

    WHILE v_date <= v_end_date DO
        SET v_day_in_cycle = MOD(DATEDIFF(v_date, v_start_date), 28);

        IF v_day_in_cycle BETWEEN 0 AND 4 THEN
            SET v_cycle_phase = 1;
            SET v_body_status = IF(v_day_in_cycle <= 1, 6, 7);
            SET v_pain_level = IF(v_day_in_cycle <= 1, 4, 3);
        ELSEIF v_day_in_cycle BETWEEN 5 AND 12 THEN
            SET v_cycle_phase = 2;
            SET v_body_status = IF(MOD(v_day_in_cycle, 3) = 0, 7, 1);
            SET v_pain_level = IF(v_body_status = 1, 1, 2);
        ELSEIF v_day_in_cycle BETWEEN 13 AND 15 THEN
            SET v_cycle_phase = 3;
            SET v_body_status = 3;
            SET v_pain_level = 2;
        ELSE
            SET v_cycle_phase = 4;
            SET v_body_status = IF(MOD(v_day_in_cycle, 2) = 0, 4, 5);
            SET v_pain_level = IF(v_day_in_cycle >= 24, 3, 2);
        END IF;

        INSERT INTO menstrual_record
            (user_id, record_date, cycle_phase, body_status, pain_level, created_at, updated_at, deleted_at)
        VALUES
            (v_user_id, v_date, v_cycle_phase, v_body_status, v_pain_level, NOW(), NOW(), NULL)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            cycle_phase = VALUES(cycle_phase),
            body_status = VALUES(body_status),
            pain_level = VALUES(pain_level),
            updated_at = NOW(),
            deleted_at = NULL;

        SET v_record_id = LAST_INSERT_ID();

        DELETE FROM menstrual_record_item
        WHERE record_id = v_record_id;

        INSERT INTO menstrual_record_item
            (record_id, body_status, pain_level, created_at, updated_at)
        VALUES
            (v_record_id, v_body_status, v_pain_level, NOW(), NOW()),
            (
                v_record_id,
                CASE v_cycle_phase
                    WHEN 1 THEN IF(v_body_status = 6, 7, 6)
                    WHEN 2 THEN 1
                    WHEN 3 THEN 1
                    ELSE IF(v_body_status = 4, 5, 4)
                END,
                CASE v_cycle_phase
                    WHEN 1 THEN 2
                    WHEN 2 THEN 1
                    WHEN 3 THEN 1
                    ELSE 2
                END,
                NOW(),
                NOW()
            );

        SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);
    END WHILE;
END$$

DELIMITER ;

CALL seed_menstrual_records_user4();

DROP PROCEDURE IF EXISTS seed_menstrual_records_user4;

-- 校验数据量
SELECT
    user_id,
    COUNT(*) AS record_count,
    SUM(cycle_phase = 1) AS menstrual_phase_count,
    MIN(record_date) AS first_record_date,
    MAX(record_date) AS last_record_date
FROM menstrual_record
WHERE user_id = 4
  AND record_date BETWEEN '2026-01-19' AND '2026-05-28'
GROUP BY user_id;

-- 校验预测所需的经期开始记录。这里应该至少看到 5 条。
SELECT
    user_id,
    record_date AS period_start_date,
    cycle_phase,
    body_status,
    pain_level
FROM menstrual_record
WHERE user_id = 4
  AND cycle_phase = 1
  AND record_date IN ('2026-01-19', '2026-02-16', '2026-03-16', '2026-04-13', '2026-05-11')
ORDER BY record_date;
