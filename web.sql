DROP DATABASE IF EXISTS web;
CREATE DATABASE web;
USE web;
CREATE TABLE user (
    id INT AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    userpass VARCHAR(255) NOT NULL,
    email VARCHAR(40) default(NULL),
    isAdmin BOOLEAN DEFAULT('false'),
    PRIMARY KEY (id)
);

CREATE TABLE location (
    user_id INT NOT NULL,
    time BIGINT NOT NULL,
    latitude INT NOT NULL,
    longitude INT NOT NULL,
    PRIMARY KEY (user_id, time),
    FOREIGN KEY (user_id)
        REFERENCES user(id)
);

CREATE TABLE activity (
    location_user_id INT NOT NULL,
    location_time BIGINT NOT NULL,
    time BIGINT NOT NULL,
    type ENUM('EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE', 'ON_BICYCLE', 'ON_FOOT', 'RUNNING', 'STILL', 'TILTING', 'UNKNOWN', 'WALKING'),
    PRIMARY KEY (location_user_id, location_time, time),
    FOREIGN KEY (location_user_id, location_time)
        REFERENCES location(user_id, time)
);

INSERT INTO user (username,userpass,email,isAdmin) VALUES ("Γιάννης","12313fdsa3","Giannaros@gmail.com",false);