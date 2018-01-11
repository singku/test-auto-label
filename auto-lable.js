var express = require('express');
var request = require('request');
var GithubWebHook = require('express-github-webhook');
var bodyParser = require('body-parser');

var labels = ["Help Wanted", "Question", "Enhancement", "Suggestion", "Bug"];

var accessToken = process.env.GITHUB_ISSUE_TOKEN;

var webhookSettings = {
  path: process.env.WEBHOOK_PATH || '/',
  secret: process.env.GITHUB_SECRET || 'Super@Secret'
}

var webhookHandler = GithubWebHook(webhookSettings);

var app = express();
app.set('port', process.env.PORT || 8080);
app.use(bodyParser.json());
app.use(webhookHandler);

function guessLabelFromData(content)
{
    var index = content.indexOf("\r\n");
    if (index > -1) {
        var index = index + 2;
        var index2 = content.indexOf("\r\n", index);
        if (index2 > -1) {
            var label = content.substr(index, index2 - index);
        } else {
            var label = content.substr(index);
        }
    }
    var loc = labels.indexOf(label);
    if (loc != -1) {
        return labels[loc];
    }
    return labels[0];
}

webhookHandler.on('issues', function (repo, data) {
    if (data.action !== 'opened' || labels.length === 0) return;
    console.log('Incoming webhook. ' + repo + "#" + data.issue.number);
    //console.log(data);
    var opts = {
        method:'POST',
        uri: data.issue.url + '/labels',
        headers: {
            'User-Agent': 'Test-Auto-Label',
            'Authorization': 'token '+accessToken,
            'Content-Type': 'application/json'
        },
        form: JSON.stringify([guessLabelFromData(data.issue.body)])
    }
    request(opts, function(err, results, body){
        if (err) console.error(err);
        //console.log('API response ' + JSON.stringify(body, null, ' '));
    })
})

webhookHandler.on('error', function (err, req, res) {
    console.error('an error occurred', err);
})

app.listen(app.get('port'), function () {
  console.log('Auto Labeler listening on port ' + app.get('port'));
})

process.on('exit', function (code) {
    console.log('About to exit with code:', code);
    console.trace("Here");
});  

process.on('SIGHUP', function () {
    console.log('Got SIGHUP signal.');
    process.exit(0);
});

process.on('SIGTERM', function () {
    console.log('Got SIGTERM signal.');
    process.exit(0);
});

process.on('SIGINT', function () {
    console.log('Got SIGINT signal.');
    process.exit(0);
});
