const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'http://localhost:5000';

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/register') || req.url.startsWith('/login') || req.url.startsWith('/api/')) {
        proxy.web(req, res, { target: TARGET }, (err) => {
            console.error('Proxy error:', err);
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Bad gateway');
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Dev proxy running. Forwarding /register and /api to ${TARGET}`);
    }
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(PORT, () => {
    console.log(`Dev proxy listening on port ${PORT}, forwarding to ${TARGET}`);
});
