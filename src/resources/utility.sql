/*** DELETE ***/
DELETE m, e, r, t, v
FROM meta m
LEFT JOIN entries e ON e.bracket_id = m.id
LEFT JOIN results r ON r.bracket_id = m.id
LEFT JOIN timing t ON t.bracket_id = m.id
LEFT JOIN voting v ON v.bracket_id = m.id
WHERE m.id = '9A33671CD6AE079B512AF922F5BBF0D4';

/*** VIEW ***/
SELECT m.title, t.*
FROM timing t
JOIN meta m ON m.id = t.bracket_id
WHERE 1;