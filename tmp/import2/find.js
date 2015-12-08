var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd()+"/db/";

var Doc = new LinvoDB("patients", { /* schema, can be empty */ });

// Doc.ensureIndex({ fieldName: "fn", unique: false }, function(e){
	// console.log(e);
	
// });

// var s = new Date();
	// Doc.find({fn: 'ИВАНОВ'}, function (err, docs) {
		// console.log(docs);
		// console.log("Время поиска: %s", new Date()-s );
	// });
	
var http = require('http');
  
var  hostname = '127.0.0.1';
var port = 1337;

http.createServer((req, res) => {
	var reqNum = decodeURIComponent(req.url.replace("/", "").toString()).toUpperCase();
	console.log(decodeURIComponent(reqNum));
	var s = new Date(); 
  Doc.find({fn: reqNum}, function(err, docs){
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(JSON.stringify(docs));
	console.log(docs);
	console.log("Время поиска: %s", new Date()-s );
  });
  
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});