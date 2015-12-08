var Datastore = require('nedb')
  , db = new Datastore({ filename: './nedb/patient.db', autoload: true });

// var s1 = new Date();
  // db.ensureIndex({ fieldName: 'sn' }, function (err) {
  // if(err) console.log(err);
  // // If there was an error, err is not null
  // console.log("Время индекса: %s", new Date()-s1 );
// });
 
  
var http = require('http');
  
var  hostname = '127.0.0.1';
var port = 1337;

http.createServer((req, res) => {
	var s = new Date();
  db.find({fn: 'ИВАНОВ'}, function(err, docs){
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(JSON.stringify(docs));
	console.log(docs);
	console.log("Время поиска: %s", new Date()-s );
  });
  
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});