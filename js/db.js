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

Pat.newPatient = function(param, cb) {
	// console.log(param);

	Pat.findOne({}).sort({
		num: -1
	}).exec(function(err, docs) {
		//console.log(docs);
		var maxNum = docs.num;
		param.num = ++maxNum;
		//console.log(param.num);

		Pat.insert(param, function(err, newDoc) {
			//console.log('new patient added');
			//console.log(newDoc);
			cb();
		})

	});
}


Pat.editPatient = function(num, param, cb) {
	//console.log('Edit Patietn: ' + num);
	//console.log(param);
	Pat.update({
		num: num
	}, {
		$set: param
	}, {}, function(err, numReplaced) {
		// numReplaced = 3
		if (err) console.log(err);
		// console.log('numReplaced: %s', numReplaced);
		cb();
	});

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