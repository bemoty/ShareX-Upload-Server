async function root(_req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    res.render('root', { public: this.c.public });
}
module.exports = root;
