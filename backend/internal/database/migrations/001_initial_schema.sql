CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_num TEXT NOT NULL,
    name TEXT NOT NULL,
    year INTEGER,
    theme_id INTEGER,
    num_parts INTEGER,
    set_image_url TEXT,
    set_url TEXT,
    last_modified DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sets_set_num ON sets(set_num);
CREATE INDEX IF NOT EXISTS idx_sets_deleted_at ON sets(deleted_at);

CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_num TEXT NOT NULL,
    name TEXT NOT NULL,
    part_cat_id INTEGER,
    part_image_url TEXT,
    part_url TEXT,
    external_ids TEXT,
    print_of TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_parts_part_num ON parts(part_num);
CREATE INDEX IF NOT EXISTS idx_parts_deleted_at ON parts(deleted_at);

CREATE TABLE IF NOT EXISTS set_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL,
    part_id INTEGER NOT NULL,
    color_id INTEGER NOT NULL,
    color_name TEXT,
    color_hex TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_spare INTEGER DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME,
    CONSTRAINT fk_set_parts_set FOREIGN KEY(set_id) REFERENCES sets(id),
    CONSTRAINT fk_set_parts_part FOREIGN KEY(part_id) REFERENCES parts(id)
);

CREATE INDEX IF NOT EXISTS idx_set_parts_set_id ON set_parts(set_id);
CREATE INDEX IF NOT EXISTS idx_set_parts_part_id ON set_parts(part_id);
CREATE INDEX IF NOT EXISTS idx_set_parts_deleted_at ON set_parts(deleted_at);
DELETE FROM set_parts
WHERE deleted_at IS NULL
  AND id NOT IN (
    SELECT MIN(id)
    FROM set_parts
    WHERE deleted_at IS NULL
    GROUP BY set_id, part_id, color_id, is_spare
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_set_parts_identity_active ON set_parts(set_id, part_id, color_id, is_spare) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS missing_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL,
    part_id INTEGER NOT NULL,
    color_id INTEGER NOT NULL,
    color_name TEXT,
    color_hex TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_missing INTEGER DEFAULT 1,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME,
    CONSTRAINT fk_missing_parts_set FOREIGN KEY(set_id) REFERENCES sets(id),
    CONSTRAINT fk_missing_parts_part FOREIGN KEY(part_id) REFERENCES parts(id)
);

CREATE INDEX IF NOT EXISTS idx_missing_parts_set_id ON missing_parts(set_id);
CREATE INDEX IF NOT EXISTS idx_missing_parts_part_id ON missing_parts(part_id);
CREATE INDEX IF NOT EXISTS idx_missing_parts_deleted_at ON missing_parts(deleted_at);

UPDATE missing_parts
SET quantity = (
    SELECT SUM(mp2.quantity)
    FROM missing_parts mp2
    WHERE mp2.deleted_at IS NULL
      AND mp2.set_id = missing_parts.set_id
      AND mp2.part_id = missing_parts.part_id
      AND mp2.color_id = missing_parts.color_id
)
WHERE deleted_at IS NULL
  AND id IN (
    SELECT MIN(id)
    FROM missing_parts
    WHERE deleted_at IS NULL
    GROUP BY set_id, part_id, color_id
  );

DELETE FROM missing_parts
WHERE deleted_at IS NULL
  AND id NOT IN (
    SELECT MIN(id)
    FROM missing_parts
    WHERE deleted_at IS NULL
    GROUP BY set_id, part_id, color_id
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_missing_parts_identity_active ON missing_parts(set_id, part_id, color_id) WHERE deleted_at IS NULL;
