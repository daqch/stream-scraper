CREATE TABLE  IF NOT EXISTS platform (
    "id" serial PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    "xpath" varchar(255) NOT NULL,
    "base_url" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS streamer (
    "id" serial PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    "platform" int references platform(id) NOT NULL,
    "user_url" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "entry" (
    "id" serial PRIMARY KEY,
    "streamer_id" int references streamer(id) NOT NULL,
    "date" timestamptz NOT NULL,
    "viewers" integer NOT NULL
);
