var fs = require('fs');

var patients = [];

var LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("medeadown") };
LinvoDB.dbPath = process.cwd(); 
var Doc = new LinvoDB("patients", { /* schema, can be empty */ });

fs.readFile('karta1.csv', function (err, data) {
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
	Doc.ensureIndex({ fieldName: "fn" });
}); 





