var sys = require("sys")
var http = require("http")
var redis = require("./redis")
require("./utilities")

// create the datastore client

var client = new redis.Client()
client.connect()

// request handler functions

var index = function(request, response) {
	client.lrange('transactions', 0, 9).addCallback(function(transactions) {
		var rows = transactions.map(function(transaction) {
			return transaction.split(",")
		}).reduce(function(element, value) {
			return value + "<tr><td>" + element[0] + "</td><td>" + element[1] + "</td></tr>"
		}, "")
		respond(response, 200, '<html><head><title>How Much</title></head><body><table><caption>10 most recent transactions</caption><tr><th>Amount</th><th>What</th></tr>' + rows + '</table><form method="post" action="/">I spent <input type="text" name="amount"> on <input type="text" name="what"> <input type="submit" value="Submit"></p></form></body></html>')
	})
}

var save = function(request, response) {
	var body = "?"
	var res = response
	request.addListener("body", function(chunk) { body += chunk })
	request.addListener("complete", function() {
		var transaction = http.parseUri(body).params
		store(transaction)
		index(request, response)
	})
}

var notFound = function(request, response) {
	var page = "<html><head><title>Page Not Found</title></head><body>Page Not Found</body></html>"
	respond(response, 404, page)
}

// set up the request handlers

var handlers = {}

handlers[["GET", "/"]] = index

handlers[["POST", "/"]] = save

// start the server

http.createServer(function(request, response) {
	(handlers[[request.method, request.uri.path]] || notFound)(request, response)
}).listen(8000)


// utility functions

var store = function(transaction) {
	client.lpush('transactions', [transaction.amount, transaction.what])
}

var respond = function(response, statusCode, body) {
	response.sendHeader(statusCode, {"Content-Type":"text/html","Content-Length":body.length})
	response.sendBody(body)
	response.finish()
}
