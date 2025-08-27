// index.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.use('/', (req, res, next) => {
    const targetUrl = req.query.target;

    if (!targetUrl) {
        return res.status(400).send('Please provide a "target" query parameter with the URL to proxy. Example: /?target=https://www.example.com');
    }

    try {
        new URL(targetUrl);
    } catch (error) {
        return res.status(400).send('Invalid "target" URL provided.');
    }

    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) => {
            if (proxyReq.path.includes('target=')) {
                proxyReq.path = proxyReq.path.split('?')[0] +
                                (req._parsedUrl.searchParams.toString().replace(/&?target=[^&]*/, '') ? '?' + req._parsedUrl.searchParams.toString().replace(/&?target=[^&]*/, '') : '');
            }
        },
        logger: console,
    })(req, res, next);
});

app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});
