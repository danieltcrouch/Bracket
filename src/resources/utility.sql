/*** DELETE ***/
DELETE m, c, r, t, v
FROM meta m
LEFT JOIN choices c ON c.meta_id = m.id
LEFT JOIN results r ON r.meta_id = m.id
LEFT JOIN timing t ON t.meta_id = m.id
LEFT JOIN voting v ON v.meta_id = m.id
WHERE m.id = '5AD50E76E16B8323E47F64D929E0BC1C';

/*** VIEW ***/
SELECT m.title, t.*
FROM timing t
JOIN meta m ON m.id = t.bracket_id
WHERE 1;