var App = {};

App.init = function() {
	App.loadTemplate('app', {
		title: 'Привет'
	}, "#main-view");
	App.test();
}

window.onload = function() {
	App.init();
}

App.loadTemplate = function(view, data, target) {
	var swig = require('swig'),
		fileName = 'view/' + view + '.html';
	var template = swig.renderFile(fileName, data || {});
	if (target)
		return $(target).html(template);
	return template;
};

App.test = function() {
	
	var LinvoDB = require("linvodb3");
	LinvoDB.defaults.store = {
		db: require("medeadown")
	};
	LinvoDB.dbPath = process.cwd() + "/db/";
	App.Doc = new LinvoDB("patients", { /* schema, can be empty */ });

	App.Doc.find({
		num: 1
	}, function(err, docs) {
		alert(JSON.stringify(docs));
	});

	
	var inp = document.getElementById('find-input');
	var btn = document.getElementById('btn');
	btn.onclick = function() {
		var s = new Date();
		var reqNum = inp.value.toUpperCase();
		App.Doc.find({
			fn: {
				$regex: new RegExp("^" + reqNum)
			}
		}, function(err, docs) {
			if (err) console.log(err);
			alert(docs.length);
		});
	}
}