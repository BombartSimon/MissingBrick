ALTER TABLE sets ADD COLUMN notes TEXT DEFAULT '';
ALTER TABLE sets ADD COLUMN storage_location TEXT DEFAULT '';
ALTER TABLE sets ADD COLUMN build_status TEXT NOT NULL DEFAULT 'not_started';

CREATE TABLE IF NOT EXISTS set_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    original_name TEXT,
    content_type TEXT,
    size_bytes INTEGER,
    url TEXT NOT NULL,
    title TEXT,
    photo_type TEXT NOT NULL DEFAULT 'other',
    is_primary INTEGER DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME,
    CONSTRAINT fk_set_photos_set FOREIGN KEY(set_id) REFERENCES sets(id)
);

CREATE INDEX IF NOT EXISTS idx_set_photos_set_id ON set_photos(set_id);
CREATE INDEX IF NOT EXISTS idx_set_photos_deleted_at ON set_photos(deleted_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_set_photos_primary_active ON set_photos(set_id) WHERE deleted_at IS NULL AND is_primary = 1;
