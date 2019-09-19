/*** DELETE ***/
DELETE m, c, r, t, v
FROM meta m
LEFT JOIN choices c ON c.meta_id = m.id
LEFT JOIN results r ON r.meta_id = m.id
LEFT JOIN timing t ON t.meta_id = m.id
LEFT JOIN voting v ON v.meta_id = m.id
LEFT JOIN subscriptions s ON s.meta_id = m.id
WHERE m.id IN ('B18D94751389913DC3AEC343CE0253B9');

/*** RESET ***/
UPDATE meta m, timing t
SET m.state = 'ready', t.scheduled_close = NULL, t.active_id = ''
WHERE m.id = 'F1F008717D9EF80963E932F01E0AD2E9' AND t.meta_id = 'F1F008717D9EF80963E932F01E0AD2E9';
/* UPDATE meta m, timing t SET m.state = 'ready', t.scheduled_close = NULL, t.active_id = '' WHERE m.id = :surveyId AND t.meta_id = :surveyId; */

DELETE r, v
FROM meta m
LEFT JOIN results r ON r.meta_id = m.id
LEFT JOIN timing t ON t.meta_id = m.id
LEFT JOIN voting v ON v.meta_id = m.id
WHERE m.id IN ('F1F008717D9EF80963E932F01E0AD2E9');

/*** VIEW ***/
SELECT m.title, t.*
FROM timing t
JOIN meta m ON m.id = t.meta_id
WHERE 1;