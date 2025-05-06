create database todos;
grant all on todos.* to 'apple'@'localhost';
flush privileges;

use todos;

create table users (
	userid varchar(20) primary key,
    userpw varchar(3000) not null,
    name varchar(20) not null,
    email varchar(50) not null
);
select * from users;


create table todos(
	idx int auto_increment primary key,
    userid varchar(20) not null,
    dos varchar(200) not null,
    foreign key(userid) references users(userid)
);
select * from todos;