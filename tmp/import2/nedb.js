var fs = require('fs');
var Datastore = require('nedb')
  , db = new Datastore({ filename: './nedb/patient.db', autoload: true });
// You can issue commands right away
var patients = [];

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
	}
	console.log(patients.length);
	//console.log(patients[1]);
	db.insert(patients, function(err) { 
		if(err) console.log(err);
	});
	// Doc.ensureIndex({ fieldName: "fn" });
}); 

