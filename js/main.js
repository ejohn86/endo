var gui = require("nw.gui");
var win = gui.Window.get();
//win.showDevTools();

var App = {};
var Pat = require('./js/db.js').Pat;

App.currentValue = '';

// defer request for fast change finded value
App.onChangeInterval = null;
App.deferRequestBy = 300;

console.log(App.deferRequestBy);

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
	// console.log(template);
	if (target)
		return $(target).html(template);
	return template;
};

App.test = function() {

}


// event listener for find input
App.events = function() {
	that = this;
	var inp = document.getElementById('find-input');
	var btn = document.getElementById('btn');
	var value = inp.value;

	// press find button
	btn.onclick = function() {
		var inpValue = inp.value.toUpperCase();
		App.search(inpValue, function(err, res) {
			if (err) console.log(err);
			App.printResult(res);
			//alert(JSON.stringify(res));			
		});
	}

	// input listener
	inp.onkeyup = function(e) {
		var value = inp.value;

		// press Enter
		e = e || window.event;
		if (e.keyCode === 13) {
			// var inpValue = inp.value;
			App.search(value, function(err, res) {
				if (err) console.log(err);
				App.printResult(res);
				//alert(JSON.stringify(res));
			});
		}
		if (value.length > 3 || value.length == 0) {
			clearInterval(that.onChangeInterval);
			if (that.currentValue != value) {
				that.onChangeInterval = setInterval(function() {
					clearInterval(that.onChangeInterval);
					that.currentValue = value;
					App.search(value, function(err, res) {
						if (err) console.log(err);
						App.printResult(res);
						//alert(JSON.stringify(res));
					});
				}, that.deferRequestBy);
			}
		}
		return false;
	}

}

App.printResult = function(data) {
	data = App.printResult.formatData(data);
	App.loadTemplate('find-result', {
		data: data
	}, "#find-result");
}

App.printResult.formatData = function(dataArr) {
	var ucFirst = function(str) {
		return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
	}
	return dataArr.map(function(item) {
		item.fn = ucFirst(item.fn);
		item.sn = ucFirst(item.sn);
		item.tn = ucFirst(item.tn);
		return item;
	});
}

App.search = function(str, cb) {
	console.log('search')
	var str = str || '';
	if (str.length == 0) {
		cb(null, []);
	} else {
		var searchArr = str.split(/\s+/);
		var l = searchArr.length;
		var findObj = {};

		if (l == 1) {
			findObj.fn = new RegExp('^' + searchArr[0], 'i');
		}
		if (l == 2) {
			findObj.fn = new RegExp('^' + searchArr[0] + "$", 'i'); // полная фамилия
			findObj.sn = new RegExp('^' + searchArr[1], 'i');
		}
		if (l >= 3) {
			findObj.fn = new RegExp('^' + searchArr[0] + "$", 'i'); // полная фамилия
			findObj.sn = new RegExp('^' + searchArr[1] + "$", 'i'); // полное имя
			findObj.tn = new RegExp('^' + searchArr[2], 'i');
		}

		Pat.find(findObj).limit(10).sort({
			fn: 1,
			sn: 1,
			tn: 1
		}).exec(function(err, docs) {
			if (err) {
				console.log(err);
				cb(err, null);
			}
			cb(null, docs)
				// alert(docs.length + ": " + t);
		});
	}
}