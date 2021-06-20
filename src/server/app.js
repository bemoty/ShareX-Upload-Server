import express from 'express';
import bodyParser from 'body-parser';
import { join, dirname } from 'path';
import utils from '../util/index.js';
import routes from './routes/index.js';
import { Low, JSONFileSync } from 'lowdb';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

const app = express();
const adapter = new JSONFileSync('db.json');
const db = new Low(adapter);
const __dirname = dirname(fileURLToPath(import.meta.url));

/** Express Webserver Class */
export default class ShareXAPI {
    /**
   * Starting server, handling routing, and middleware
   * @param {object} c - configuration json file
   */
    constructor(c) {
        this.db = db;
        this.db.read().then(() => {
            /** Defintions */
            this.utils = utils;
            this.log = utils.log;
            this.auth = utils.auth;
            this.randomToken = utils.randomToken;
            this.mimeType = utils.mimeType;
            this.c = c;
            this.monitorChannel = null;
            this.app = app;
            this.app.set('view engine', 'ejs');
            this.app.set('views', join(__dirname, 'views'));
            this.app.use(helmet());
            this.app.use(bodyParser.text());
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({
                extended: true,
            }));

            /* Don't allow access if not accessed with configured domain */
            this.app.use((req, res, next) => {
                if (this.c.domain === '*') {
                    next();
                } else if (req.headers.host !== this.c.domain.toLowerCase() && !this.c.domain.includes('*')) {
                    res.statusCode = 401;
                    res.write('Error 401: Unauthorized Domain');
                    return res.end();
                } else if (this.c.domain.includes('*')) {
                    let reqParts = req.headers.host.toLowerCase().split('.');
                    let domainParts = this.c.domain.toLowerCase().split('.')
                    if (reqParts[1] === domainParts[1] && reqParts[2] === domainParts[2]) {
                        next();
                    } else {
                        res.statusCode = 401;
                        res.write('Error 401: Unauthorized Domain');
                        return res.end();
                    }
                } else {
                    next();
                }
            });

            /** Set to place IPs in temporarily for ratelimiting uploads */
            const ratelimited = new Set();
            this.app.use((req, res, next) => {
                if (req.method === 'POST') {
                    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                    if (ratelimited.has(userIP)) {
                        res.statusCode = 429;
                        res.write('Error 429: Ratelimited');
                        return res.end();
                    }
                    next(); // Move on if IP is not in ratelimited set
                    ratelimited.add(userIP);
                    // delete IP from ratelimit set after time specified in config.json
                    setTimeout(() => ratelimited.delete(userIP), c.ratelimit);
                } else {
                    next(); // move on if request type is not POST
                }
            });
            this.app.use((req, res, next) => {
                if (req.method === 'GET') {
                    let file = req.path;
                    // Not ignoring these files causes bloat in the db
                    const ignored = ['/favicon.ico', '/assets/css/styles.min.css', '/highlight.pack.js', '/highlightjs-line-numbers.min.js', '/paste.css', '/atom-one-dark.css'];
                    let exists = this.db.data.files.find((e) => e.path === file);
                    // making sure ignored files aren't included
                    if (ignored.includes(file)) exists = true;
                    next();
                } else {
                    next();
                }
            });

            // All files in /uploads/ are publicly accessible via http
            this.app.use(express.static(join(__dirname, `uploads`), {
                extensions: this.c.admin.allowed.includes("*") ? null : this.c.admin.allowed,
            }));
            this.app.use(express.static(join(__dirname, `views`), {
                extensions: ['css'],
            }));

            // routing
            this.app.get('/', routes.root.bind(this));
            this.app.get('*', routes.err404.bind(this));
            this.app.post('/api/shortener', routes.shortener.bind(this));
            this.app.post('/api/paste', routes.paste.bind(this));
            this.app.post('/api/files', routes.files.bind(this));

            // Begin server
            this.startServer();
        });
    }

    /** Start's the Express server
   * @returns {void}
   */
    async startServer() {
        this.app.listen(this.c.port, '0.0.0.0', () => {
            this.log.success(`Server listening on port ${this.c.port}`);
        });
    }

    protocol() {
        return 'https';
    }
}
