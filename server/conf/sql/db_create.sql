CREATE TABLE user (
	user_id	INTEGER NOT NULL,
	username	TEXT NOT NULL,
	password	TEXT NOT NULL,
	auth_key	TEXT DEFAULT NULL,
	is_admin	INTEGER NOT NULL DEFAULT 0,
	email_address	TEXT,
	salty	TEXT,
	last_ip_address	TEXT,
	PRIMARY KEY(user_id)
);

CREATE TABLE user_settings (
	user_id	INTEGER NOT NULL,
	settings_json	TEXT,
	PRIMARY KEY(user_id)
);