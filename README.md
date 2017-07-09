# [NJ-BirdDogs]

A website and user system, implemented with [MongoDB](https://www.mongodb.org/), [Express](http://expressjs.com/), [AngularJS](https://angularjs.org/) and [Node.js](https://nodejs.org/), a.k.a MEAN stack.

## Features

 - Versatility because you can
    - Hack your next awesome MEAN stack web app on top of [NJ-BirdDogs], or
    - Use only the client as a non-trivial AngularJS project starter, or
    - Use only the sever as a pure User Management JSON API server.
 - Stand alone RESTful API service capable of serving any http clients, including iOS and Android app.
 - Social Login enabled currently for __Facebook__ and __Google__.
 - Fully functional user life cycle management.
 - Admin panel provides full CRUD UI on all database entity.
 - Responsive web design supports Mobile-First Development.

## Technology

[NJ-BirdDogs]'s backend is pure Node.js RESTful API Server that renders no html pages . Front-end is built with [AngularJS](https://angularjs.org/), [Bootstrap](https://angular-ui.github.io/bootstrap/) and [SASS](http://sass-lang.com/).
[Grunt](http://gruntjs.com/) manages various development, testing and production build tasks.

| On The Server  | On The Client | Development |
|:--------------:|:-------------:|:-----------:|
| Express        | AngularJS     | Grunt       |
| Mongo/Mongoose | Bootstrap     | Npm         |
| Passport       | SASS          | Bower       |
| EmailJS        | Font-Awesome  | Karma       |
|                | Moment.js     |             |




## Requirements

Have these packages installed and running on your system.

- [Node.js](https://nodejs.org/download/), and npm.
- [MongoDB](https://www.mongodb.org/downloads)
- [SASS](http://sass-lang.com/install)
- [Grunt-cli](http://gruntjs.com/getting-started)
- [Bower](http://bower.io/#install-bower)

We use [`bcrypt`](https://github.com/ncb000gt/node.bcrypt.js) for hashing
secrets. If you have issues during installation related to `bcrypt` then [refer
to this wiki
page](https://github.com/jedireza/drywall/wiki/bcrypt-Installation-Trouble).


## Installation
```bash
$ git clone [git URL]
$ npm install
$ cd client && bower install && cd ..
```

## Setup

Interactively setup basic website and necessary database configurations.
```bash
$ node init.js
```

*Alternatively,* modify config.example.js and initialize database manually. __Not recommended.__

```bash
$ cp ./config.example.js ./config.js
$ vi config.js  #set mongodb and email credentials
$ mongo # use mongo shell to insert required documents. Refer to ./init.js for the list of docs
```

## Running the app

```bash
$ grunt

# > grunt

# Running "clean:src" (clean) task
# ...

# Running "concurrent:dev" (concurrent) task
# Running "watch" task
# Running "nodemon:dev" (nodemon) task
# Waiting...
# [nodemon] v1.2.1
# [nodemon] to restart at any time, enter `rs`
# [nodemon] watching: *.*
# [nodemon] starting `node app.js`
```

Now [NJ-BirdDogs] should be up and running at `http://localhost:3000`.




## Philosophy

 - MEAN stack web app starter with user management up and running in 5 minutes.
 - Carefully built on top of latest state-of-the-art javascript technologies.
 - RESTful API service that easily serves non-browser (iOS, Android, among others) clients.
 - [Single page web application](http://en.wikipedia.org/wiki/Single-page_application).


## Questions and contributing

Any issues or questions (no matter how basic), open an issue. Please take the
initiative to include basic debugging information like operating system
and relevant version details such as:

```bash
$ npm version

#{ 'angular-drywall': '0.1.1,
#  http_parser: '1.0',
#  node: '0.10.29',
#  v8: '3.14.5.9',
#  ares: '1.9.0-DEV',
#  uv: '0.10.27',
#  zlib: '1.2.3',
#  modules: '11',
#  openssl: '1.0.1h',
#  npm: '2.1.7' }
```

Contributions are welcome.


## License

NJ BirdDogs 2017.