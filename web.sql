DROP DATABASE IF EXISTS web;
CREATE DATABASE web;
USE web;
CREATE TABLE user (
    id INT AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    userpass VARCHAR(255) NOT NULL,
    email VARCHAR(40) default(NULL) UNIQUE,
    last_upload BIGINT DEFAULT(0),
    isAdmin TINYINT DEFAULT(0),
    PRIMARY KEY (id)
);

CREATE TABLE location (
    loc_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    time BIGINT NOT NULL,
    latitude INT NOT NULL,
    longitude INT NOT NULL,
    PRIMARY KEY (loc_id)
);

CREATE TABLE activity (
    ac_id INT NOT NULL AUTO_INCREMENT,
    location_user_id INT NOT NULL,
    location_time BIGINT NOT NULL,
    time BIGINT NOT NULL,
    type ENUM('EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE', 'ON_BICYCLE', 'ON_FOOT', 'RUNNING', 'STILL', 'TILTING', 'UNKNOWN', 'WALKING'),
    PRIMARY KEY (ac_id)
);

INSERT INTO user (username,userpass,email,isAdmin) VALUES ("ΠανΖήσης","12313@Fdsa","Web@ceid.com",true);
INSERT INTO user (username,userpass,email,isAdmin) VALUES ("Γιάννης","12313@Fdsa","Giannaros@gmail.com",false);
INSERT INTO user (username,userpass,email,isAdmin) VALUES ("Μαρία","12313@Fdsa","Mariaros@gmail.com",false);
INSERT INTO user (username,userpass,email,isAdmin) VALUES ("Κλεομενης","12313@Fdsa","Kleomenaros@gmail.com",false);
INSERT INTO user (username,userpass,email,isAdmin) VALUES ("Αβατικιωτης","12313@Fdsa","Avatikiotaros@gmail.com",false);
INSERT INTO user (username,userpass,email,isAdmin) VALUES ("Γωγώ","12313@Fdsa","Gogaros@gmail.com",false);