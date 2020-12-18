## Live session server
This is the home of the NodeJS live session backend.
It allows a Storyteller and their player to communicate through
a Websocket interface with each other.

In order to run it, you need a recent NodeJS version (v12+) and a set
of SSL Certificate and Key files in order to run the socket through
a secured connection.

### Local setup

To run the backend locally, use the following commands from the project root:

```shell
npm install
cd server/
NODE_ENV=development node index.js
```

This will open the backend server on `localhost:8081` and you
need to adjust your `/src/store/socket.js` file to connect to
the localhost backend.

### Live setup

Generate a `cert.pem` and `key.pem` file for the domain that your
live session backend will be available under, for example with [Let's Encrypt](https://letsencrypt.org/).
Copy or symlink these 2 files into your `server/` folder and then run
the following commands from the project root:

```shell
npm install
cd server/
node index.js
```

This will make the backend server available at your domain on port 8080.
If you want to have it automatically recover on crash or server restart,
you could use [pm2](https://pm2.keymetrics.io/) with the provided `ecosystem.config.js`

### Allowing access from different domains

Currently the backend server only accepts connections coming from
pages hosted on github.io or localhost. If you want to use your own
domain for the page, make sure to adjust the domain whitelist pattern
around line 15 in the `index.js`:

```ecmascript 6
  verifyClient: info =>
    !!info.origin.match(
      /^https?:\/\/([^.]+\.github\.io|localhost|live\.clocktower\.online|eddbra1nprivatetownsquare\.xyz)/i
    )
```
