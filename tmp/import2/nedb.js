var fs = require('fs');
var Datastore = require('nedb')
  , db = new Datastore({ filename: './db/patient.db', autoload: true }),
	vis = new  Datastore({ filename: './db/visit.db', autoload: true });
// You can issue commands right away
var patients = [];
var visits = [];

fs.readFile('../../../import/karta1.csv', function (err, data) {
  if (err) throw err;
  var str = data.toString();
  
	var rows = str.split('\n');
	for(var i=1, l = rows.length; i<l-1; i++){
		var o ={};
		var row = rows[i];
		row = row.split(';');
		o.num  = parseInt(row[0]);
		o.fn = row[1];
		o.sn = row[2];
		o.tn = row[3];
		o.gen = row[4];
		o.birth = row[5];
		o.addr = row[20].trim();
		patients.push(o);
	}
	console.log(patients.length);
	//console.log(patients[1]);
	db.insert(patients, function(err) { 
		if(err) console.log(err);
	});
	// Doc.ensureIndex({ fieldName: "fn" });
}); 

fs.readFile('../../../import/poset1.csv', function (err, data) {
  if (err) throw err;
  var str = data.toString();
  
	var rows = str.split('\n');
	for(var i=1, l = rows.length; i<l-1; i++){
		var o ={};
		var row = rows[i];
		row = row.split(';');
		o.num  = parseInt(row[0]);
		o.type = row[1];
		o.date = row[2];
		o.link = row[4].substr(12).trim();
		visits.push(o);
	}
	console.log(visits.length);
	vis.insert(visits, function(err, docs) { 
		if(err) console.log(err);
		vis.find({num: 31419}, function (err, docs) {
			console.log(docs);
		});		
	});
}); 
