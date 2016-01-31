var Datastore = require('nedb');
var dbPath = process.cwd() + "/db/";
var s = new Date();

var Pat = new Datastore({
	filename: dbPath + 'patient.db',
	autoload: true,
});

var Visit = new Datastore({
	filename: dbPath + 'visit.db',
	autoload: true
});

Pat.newPatient = function(param) {
	console.log(param);
	Pat.findOne({}).sort({
		num: -1
	}).exec(function(err, docs) {
		console.log(docs);
		var maxNum = docs.num;
		param.num = ++maxNum;
		console.log(param.num);

		Pat.insert(param, function(err, newDoc) {
			console.log('new patient added');
			console.log(newDoc);
		})

	});
}


Pat.editPatient = function(num) {
	console.log('new Patietn: ' + num);
}

/*Pat.loadDatabase(function(err) { // Callback is optional
	// Now commands will be executed
	
	// console.log('Pat loaded: %s', new Date -s);
});

Visit.loadDatabase(function(err) { // Callback is optional
	// Now commands will be executed
	console.log('Visit loaded: %s', new Date - s);
});
*/
exports.Pat = Pat;
exports.Visit = Visit;