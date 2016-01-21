var Datastore = require('nedb');
var dbPath = process.cwd() + "/db/";

var Pat = new Datastore({
	filename: dbPath + 'patient.db',
	autoload: true
});

var Visit = new Datastore({
	filename: dbPath + 'visit.db',
	autoload: true
});



exports.Pat = Pat;
exports.Visit = Visit;