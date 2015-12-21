var gui = require("nw.gui");
var win = gui.Window.get();
//win.showDevTools();

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
	App.events();
}

App.loadTemplate = function(view, data, target) {
	var swig = require('swig'),
		fileName = 'view/' + view + '.html';
	var template = swig.renderFile(fileName, data || {});
	console.log(template);
	if (target)
		return $(target).html(template);
	return template;
};

App.test = function() {

}

App.events = function() {
	var inp = document.getElementById('find-input');
	var btn = document.getElementById('btn');

	// нажатие на кнопку поиск
	btn.onclick = function() {
		var inpValue = inp.value.toUpperCase();
		App.search(inpValue, function(err, res) {
			if (err) console.log(err);
			App.printResult(res);
			//alert(JSON.stringify(res));			
		});
	}

	// нажатие enter
	inp.onkeyup = function(e) {
		e = e || window.event;
		if (e.keyCode === 13) {
			var inpValue = inp.value.toUpperCase();
			App.search(inpValue, function(err, res) {
				if (err) console.log(err);
				App.printResult(res);
				//alert(JSON.stringify(res));
			});
		}
		// Отменяем действие браузера
		return false;
	}

}

App.printResult = function(data) {
	App.loadTemplate('find-result', {
		data: data
	}, "#find-result");
}

App.search = function(str, cb) {
	var str = str || '';
	if (str.length == 0) {
		cb(null, []);
	}
	var searchArr = str.split(/\s+/);
	Pat.find({
		fn: new RegExp('^' + searchArr[0], 'i')
	}, function(err, docs) {
		if (err) {
			console.log(err);
			cb(err, null);
		}
		cb(null, docs)
			// alert(docs.length + ": " + t);
	});
}