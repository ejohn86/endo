var LinvoDB = require("linvodb3");
	LinvoDB.defaults.store = {
		db: require("medeadown")
	};
	LinvoDB.dbPath = process.cwd() + "/db/";
	Pat = new LinvoDB("patients", { /* schema, can be empty */ });


exports.Pat = Pat;