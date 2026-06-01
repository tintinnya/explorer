'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
const config = require('./app/config');

const host = process.env.HOST || config.explorerHost;
const port = Number(process.env.PORT || config.explorerPort);
const appDir = path.join(__dirname, 'app');

const mimeTypes = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.map': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain'
};

function send(res, statusCode, headers, body) {
    res.writeHead(statusCode, headers);
    res.end(body);
}

function redirectToHashRoute(res, route, value) {
    const target = '/#/' + route + '/' + encodeURIComponent(value);
    send(res, 302, { Location: target }, 'Redirecting to ' + target);
}

function serveFile(res, filePath) {
    fs.readFile(filePath, function(error, data) {
        if (error) {
            send(res, 404, { 'Content-Type': 'text/plain' }, 'Not found');
            return;
        }

        const ext = path.extname(filePath);
        send(res, 200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }, data);
    });
}

function getSafeFilePath(requestPath) {
    const decodedPath = decodeURIComponent(requestPath);
    const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(appDir, normalizedPath);

    if (!filePath.startsWith(appDir)) {
        return null;
    }

    return filePath;
}

const server = http.createServer(function(req, res) {
    const parsedUrl = url.parse(req.url);
    const requestPath = parsedUrl.pathname || '/';
    const txMatch = requestPath.match(/^\/tx\/([^/]+)\/?$/);
    const addressMatch = requestPath.match(/^\/address\/([^/]+)\/?$/);
    const blockMatch = requestPath.match(/^\/block\/([^/]+)\/?$/);

    if (txMatch) {
        redirectToHashRoute(res, 'transaction', txMatch[1]);
        return;
    }

    if (addressMatch) {
        redirectToHashRoute(res, 'address', addressMatch[1]);
        return;
    }

    if (blockMatch) {
        redirectToHashRoute(res, 'block', blockMatch[1]);
        return;
    }

    const filePath = getSafeFilePath(requestPath === '/' ? '/index.html' : requestPath);
    if (!filePath) {
        send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
        return;
    }

    fs.stat(filePath, function(error, stats) {
        if (error) {
            send(res, 404, { 'Content-Type': 'text/plain' }, 'Not found');
            return;
        }

        if (stats.isDirectory()) {
            serveFile(res, path.join(filePath, 'index.html'));
            return;
        }

        serveFile(res, filePath);
    });
});

server.listen(port, host, function() {
    console.log('Serving ./app at http://' + host + ':' + port);
});
