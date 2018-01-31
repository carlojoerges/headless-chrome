const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;
const validUrl = require('valid-url');
const async = require('asyncawait/async');
const await = require('asyncawait/await');


var parseUrl = function(url) {
    url = decodeURIComponent(url)
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = 'http://' + url;
    }

    return url;
};

app.get('/', function(req, res) {
    var urlToScreenshot = parseUrl(req.query.url);

    if (validUrl.isWebUri(urlToScreenshot)) {
        console.log('Screenshotting: ' + urlToScreenshot);
        const f = async(() => {
            const browser = await(puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }));

            const page = await(browser.newPage());

            process.on("unhandledRejection", (reason, p) => {
                browser.close();
            });

            await(page.goto(urlToScreenshot));
            const title = await(page.title()).replace(/[^a-zA-Z0-9-_]/g, ' ').replace(/\s\s+/g, ' ');
            await(page.pdf().then(function(buffer) {
                res.setHeader('Content-Disposition', 'attachment;filename="' + title + '.pdf"');
                res.setHeader('Content-Type', 'application/pdf');
                res.send(buffer)
            }));
            await(page.close());
            await(browser.close());
        });
        f();
    } else {
        res.send('Invalid url: ' + urlToScreenshot);
    }

});

app.listen(port, function() {
    console.log('App listening on port ' + port)
})
