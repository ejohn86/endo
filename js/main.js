var gui = require("nw.gui");
var win = gui.Window.get();
win.showDevTools();
	
var App = {};
var Pat = require('./js/db.js').Pat;



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
	Pat.find({num:1}, function(err, docs) {
			if (err) console.log(err);
			console.log("first find");
		});
	var inp = document.getElementById('find-input');
	var btn = document.getElementById('btn');
	btn.onclick = function() {
		var s = new Date(),t;
		var reqNum = inp.value.toUpperCase();
		Pat.find({
			fn: {
				$regex: new RegExp("^" + reqNum)
			}
		}, function(err, docs) {
			if (err) console.log(err);
			t = new Date() -s;
			alert(docs.length + ": " + t );
		});
	}
}