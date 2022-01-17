# My Poetry 

My Poetry Web Site

https://github.com/rightoneX/MyPoetry

## How to run it

```sh
> npm start
```

### Build

```sh
> npm install
```

### API


/list/"author"
brings a list of all author's titles

/id/
brings a id's text and title

### Database
```sh
> install PostgreSQL 
```
update /lib/routes.js with credentials

### Database Setup

CREATE TABLE public.poetry
(
  id integer NOT NULL,
  author character(64),
  title character(64),
  year character(12),
  text text,
  CONSTRAINT poetry_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.poetry
  OWNER TO postgres;



CREATE TABLE public.users (
 id UUID NOT NULL,
 firstName CHAR(64),
 middleName CHAR(64),
 lastName CHAR(64),
 email CHAR(128),
 password CHAR(60),
 CONSTRAINT users_pkey PRIMARY KEY(id)
) 
WITH (oids = false);




CREATE TABLE public.favorite
(
  id integer NOT NULL,
  userid integer,
  poetryid integer,
  description text,
  CONSTRAINT favorite_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.favorite
  OWNER TO postgres;
