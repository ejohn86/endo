var fs = require('fs');

var patients = [];
var visits = [];

var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd()+"/../../db/"; 
var Doc = new LinvoDB("patients", { /* schema, can be empty */ });
var Vis = new LinvoDB("visits", {});

/// import patient db
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
		// Doc.save(o, function(err, docs) { 
			// if(err) console.log(err);
			// console.log("save %s docs", docs.length);
		// });
	}
	console.log(patients.length);
	//console.log(patients[1]);
	Doc.save(patients, function(err, docs) { 
		if(err) console.log(err);
		console.log("save %s docs", patients.length);
	});
}); 
/// import visit db
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
		o.link = row[3].substr(12).trim();
		visits.push(o);
	}
	console.log(visits.length);
	Vis.save(visits, function(err, docs) { 
		if(err) console.log(err);
		console.log("save %s docs", visits.length);
		
		Vis.find({num: 31419}, function (err, docs) {
			console.log(docs);
		});		
	});
}); 

// var s = new Date();
// Vis.find({num: 31419}, function (err, docs) {
		// console.log(docs);
		// console.log("Время поиска: %s", new Date()-s );
	// });





