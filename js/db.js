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