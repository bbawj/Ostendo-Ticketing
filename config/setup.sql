create table users (
    id int not null auto_increment,
    email varchar(255) not null,
    password varchar(255) not null,
    role enum('admin','user') default "user",
    primary key(id)
);

create table tickets (
	id int not null auto_increment,
    owner_id int not null,
    assigned_id int default 1,
    status enum("closed", "open", "closedbyadmin") default "open",
    title varchar(255) not null,
    description text,
    created_date datetime default current_timestamp,
    closed_date datetime,
    conclusion varchar(255),
    fulltext search (description,title),
    primary key(id),
    foreign key (owner_id) references users(id),
    foreign key (assigned_id) references users(id)
);

create table comments (
	id int not null auto_increment,
    owner_id int not null,
    ticket_id int not null,
    text text not null,
    created_date datetime default current_timestamp,
    type enum("comment", "open", "closed","closedbyadmin") default "comment",
    primary key (id),
    foreign key (ticket_id) references tickets(id),
    foreign key (owner_id) references users(id)
);

create table labels (
    id int not null auto_increment,
    name varchar(100) not null,
    primary key (id)
);