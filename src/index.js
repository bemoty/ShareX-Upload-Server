import ShareXAPI from './server/app.js';

let c;
let server;
console.log(`\x1b[31m
  ======================================================================
  |\x1b[0m\x1b[34m Welcome to\x1b[31m                                                         |
  |\x1b[0m\x1b[34m Bemoty's ShareX Server\x1b[31m                                             |
  ======================================================================
  |\x1b[0m\x1b[32m Creator: github.com/bemoty\x1b[0m\x1b[31m                                         |
  ======================================================================\x1b[0m`);

/** Determines whether or not to use the test config or not.
 * Test env config does not get pushed to git
 * @returns {void}
 */
async function loadConfig() {
    process.argv[2] === '-test'
        ? c = require(`${__dirname}/config.debug.json`)
        : c = require(`${__dirname}/config.json`);
}

loadConfig().then(() => {
    /** Starting server using the selected config file */
    server = new ShareXAPI(c);
});
process.on('SIGINT', async () => {
    server.log.warning('Gracefully exiting..');
    process.exit();
});

process.on('unhandledRejection', async err => server.log.uncaughtError(err.stack));
process.on('uncaughtException', async err => server.log.uncaughtError(err.stack));
