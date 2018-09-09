const { Buffer } = require('buffer');
const { execFile } = require('child_process');
const http = require('http');

const hostname = '127.0.0.1';
const port = process.env.PORT || 8080;

const getErrorContent = (input) => {
  if (input instanceof String) {
    return input;
  }
  if (input.hasOwnProperty('message')) {
    return input.message;
  }
  return input;
};

const statusCode = (value) => {
  return (res, message) => {
    res.statusCode = value;
    res.setHeader('Content-Type', 'text/plain');
    res.end(getErrorContent(message));
  };
};

const badRequest = statusCode(400);
const serverError = statusCode(500);
const notFound = statusCode(404);

const loadBody = (req, callback) => {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    callback(null, body);
  }).on('error', callback);
};

const simc = function (params, callback) {
  const executable = '/bin/simc';
  const args = params && params.split ? params.split(' ') : params;
  const options = {};
  execFile(executable, args, options, (execErr, stdout, stderr) => {
    console.log(`${executable} ${args}... done!`);
    callback(execErr, stdout, stderr);
  });
};

const respondWithExecFileOutput = (res, stdout, stderr) => {
  if (stderr) {
    console.error(stderr);
  }
  res.end(stdout + stderr);
};

const routes = {
  '/about': (req, res) => {
    simc(null, (execErr, stdout, stderr) => {
      if (execErr) {
        badRequest(res, execErr.message);
        return;
      }
      respondWithExecFileOutput(res, stdout, stderr);
    });
  },
  '/simc': (req, res) => {
    loadBody(req, (bodyError, body) => {
      if (bodyError) {
        badRequest(res, bodyError);
        return;
      }
      simc(body, (execErr, stdout, stderr) => {
        if (execErr) {
          badRequest(res, execErr.message);
          return;
        }
        if (body.indexOf('html=') > -1) {
          res.setHeader('Content-Type', 'text/html');
        }
        respondWithExecFileOutput(res, stdout, stderr);
      });
    });
  },
};

const server = http.createServer((req, res) => {
  if (routes[req.url]) {
    routes[req.url](req, res);
    return;
  }

  loadBody(req, (bodyError, body) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(body);
    console.log(res.statusCode, req.method, req.url);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
