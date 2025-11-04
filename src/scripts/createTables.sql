CREATE DATABASE IF NOT EXISTS tfg2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tfg2;

CREATE TABLE users (
  id int auto_increment primary key,
  email varchar(120) unique not null,
  password_hash varchar(255) not null,
  role enum('admin','user') default 'user'
);

CREATE TABLE farms (
  id int auto_increment primary key,
  code varchar(20) unique not null
);

CREATE TABLE tickets (
  id int auto_increment primary key,
  farm_id int not null,
  description text not null,
  urgency enum('low','medium','high') not null,
  area enum('collar','antenna','internet','power') not null,
  status enum('open','progress','closed') default 'open',
  created_at datetime default current_timestamp,
  predicted_urgency enum('low','medium','high'),
  predicted_area enum('collar','antenna','internet','power'),
  model_accuracy decimal(5,2),
  foreign key (farm_id) references farms(id)
);

CREATE TABLE history (
  id int auto_increment primary key,
  ticket_id int not null,
  note text,
  changed_at datetime default current_timestamp,
  foreign key (ticket_id) references tickets(id)
);