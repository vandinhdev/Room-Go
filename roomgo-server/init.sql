-- ========================
-- ENUM TYPES
-- ========================
-- USER
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- ROOM
CREATE TYPE room_status AS ENUM ('AVAILABLE', 'RENTED');

-- CHAT
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');

-- NOTIFICATION
CREATE TYPE notification_type AS ENUM ('NEW_MESSAGE', 'ROOM_STATUS', 'FAVORITE_ROOM', 'SYSTEM');
CREATE TYPE delivery_method AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- EMAIL
CREATE TYPE email_status AS ENUM ('PENDING', 'SENT', 'FAILED');

-- ========================
-- TABLES
-- ========================

CREATE TABLE roles (
       id BIGSERIAL PRIMARY KEY,
       role_name VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE users (
       id BIGSERIAL PRIMARY KEY,
       first_name VARCHAR(50) NOT NULL,
       last_name VARCHAR(50) NOT NULL,
       gender gender,
       username VARCHAR(50) UNIQUE NOT NULL,
       password_hash TEXT NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       phone VARCHAR(20),
       role_id BIGINT NOT NULL REFERENCES roles(id),
       user_status user_status DEFAULT 'PENDING',
       date_of_birth DATE, -- thêm cho khớp với Hibernate entity
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
       id BIGSERIAL PRIMARY KEY,
       owner_id BIGINT NOT NULL REFERENCES users(id),
       title VARCHAR(255) NOT NULL,
       description TEXT,
       price NUMERIC(12,2) NOT NULL,
       area NUMERIC(6,2),
       province VARCHAR(100),
       district VARCHAR(100),
       ward VARCHAR(100),
       address TEXT,
       latitude DOUBLE PRECISION,
       longitude DOUBLE PRECISION,
       status room_status DEFAULT 'AVAILABLE',
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE room_images (
             id BIGSERIAL PRIMARY KEY,
             room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
             image_url TEXT NOT NULL,
             uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favorite_rooms (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id),
                room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, room_id)
);

CREATE TABLE conversations (
               id BIGSERIAL PRIMARY KEY,
               conversation_name VARCHAR(100),
               room_id BIGINT REFERENCES rooms(id),
               current_user_id BIGINT NOT NULL REFERENCES users(id),
               owner_id BIGINT NOT NULL REFERENCES users(id),
               created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    sender_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'TEXT',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    related_id BIGINT,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE notification_settings (
                       id BIGSERIAL PRIMARY KEY,
                       user_id BIGINT NOT NULL REFERENCES users(id),
                       notification_type notification_type NOT NULL,
                       is_enabled BOOLEAN DEFAULT TRUE,
                       delivery_method delivery_method DEFAULT 'IN_APP',
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW(),
                       UNIQUE(user_id, notification_type, delivery_method)
);

CREATE TABLE email_logs (
            id BIGSERIAL PRIMARY KEY,
            recipient VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            status email_status DEFAULT 'PENDING',
            error_message TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            sent_at TIMESTAMP
);

CREATE TABLE search_history (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id),
                search_query TEXT NOT NULL,
                keywords TEXT[],
                province VARCHAR(100),
                district VARCHAR(100),
                ward VARCHAR(100),
                min_price NUMERIC(12,2),
                max_price NUMERIC(12,2),
                min_area NUMERIC(6,2),
                max_area NUMERIC(6,2),
                search_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL,
                       otp_code VARCHAR(10) NOT NULL,
                       expires_at TIMESTAMP NOT NULL,
                       created_at TIMESTAMP DEFAULT NOW()
);

-- ========================
-- INDEXES
-- ========================

-- Users
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(user_status);

-- Rooms
CREATE INDEX idx_rooms_price ON rooms(price);
CREATE INDEX idx_rooms_area ON rooms(area);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_title_desc ON rooms USING GIN (to_tsvector('simple', title || ' ' || description));
CREATE INDEX idx_rooms_address ON rooms USING GIN (to_tsvector('simple', address));

-- Room Images
CREATE INDEX idx_room_images_room_id ON room_images(room_id);

-- Favorite Rooms
CREATE INDEX idx_favorite_rooms_user_id ON favorite_rooms(user_id);
CREATE INDEX idx_favorite_rooms_room_id ON favorite_rooms(room_id);

-- Conversations
CREATE INDEX idx_conversations_room_id ON conversations(room_id);
CREATE INDEX idx_conversations_current_user ON conversations(current_user_id);
CREATE INDEX idx_conversations_owner_id ON conversations(owner_id);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_conversation_created_at ON messages(conversation_id, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Notification Settings
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- Email Logs
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);

-- Search History
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_keywords ON search_history USING GIN (keywords);
CREATE INDEX idx_search_history_query ON search_history USING GIN (to_tsvector('simple', search_query));
CREATE INDEX idx_search_history_price_range ON search_history(min_price, max_price);
CREATE INDEX idx_search_history_area_range ON search_history(min_area, max_area);

-- Password Reset Tokens
CREATE INDEX idx_password_reset_email ON password_reset_tokens(email);

-- ========================
-- DEFAULT DATA
-- ========================
INSERT INTO roles (role_name) VALUES
                  ('ADMIN'),
                  ('USER'),
                  ('GUEST');

INSERT INTO users (username, password_hash, first_name, last_name, email, role_id, user_status) VALUES
                  ('admin', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5eFh8z6j6k5Z5b6a5r5H6j6a5r5H6', 'Admin', 'User', 'admin@gmail.com', 1, 'ACTIVE');

UPDATE users SET password_hash = '$2a$12$ctWdtAMuUIEQbdl9Fm8qm.saoqmBxOpGYR1fxUZWyPGpmvtxLhYWS' WHERE id = 1;