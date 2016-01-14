var gui = require("nw.gui");
var win = gui.Window.get();
var path = require('path');
//win.showDevTools();

var App = {};
var Pat = require('./js/db.js').Pat;
var Visit = require('./js/db.js').Visit;

App.currentValue = '';

// defer request for fast change finded value
App.onChangeInterval = null;
App.deferRequestBy = 300;



App.init = function() {
	App.loadTemplate('app', {
		title: 'ma'
	}, "#main-view");
}

window.onload = function() {
	App.init();
	App.events();
	App.test();
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
	// gui.Shell.showItemInFolder('package.json');
	// gui.Shell.openItem('../docs/doc/1/1004.doc');
	//console.log(path.resolve('../docs/doc/1/'));
	//console.log('Current directory: ' + process.cwd());

	// gui.Shell.openItem(path.resolve('../docs/doc/1/1004.doc'));
}


// event listener for find input
App.events = function() {
	that = this;
	var inp = document.getElementById('find-input');
	var table = document.getElementById('find-result');

	var value = inp.value;

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

	// listener for open visit list on patient
	table.onclick = function(event) {
		if (event.target.id == "find-result" || event.target.tagName == "TBODY") return;
		var target = event.target;
		while (target.tagName != 'TR') {
			target = target.parentNode;
		}
		var id = target.getAttribute('data-toggle-id');
		if (!id) return;



		App.search.patietnVisitList(id, function(err, doc) {
			if (err) console.log(err);
			App.printResult.visitList(doc, id);

		});
		// $(elem).fadeToggle("slow");
		var elem = document.getElementById("full-" + id);
		elem.hidden = !elem.hidden;

	}

	// visit link listener
	document.onclick = function(event) {
		var target = event.target;
		if (!target.hasAttribute('data-doc-link')) return;
		var link = target.getAttribute('data-doc-link');
		App.openDoc(link);
		return false;
	}

	//show edit btn 
	table.onmouseover = function(event) {
		var el = findEditElement(event);
		if (el)
			el.hidden = false;

	}

	table.onmouseout = function(event) {
		var el = findEditElement(event);
		if (el)
			el.hidden = true;

	}

	findEditElement = function(event) {
		if (event.target.id == "find-result" || event.target.tagName == "TBODY") return;
		// console.log(event)
		var target = event.target;
		while (target.tagName != 'TR') {
			target = target.parentNode;
		}
		var id = target.getAttribute('data-toggle-id');
		if (!id) return;
		return elem = document.getElementById('edit-btn-' + id);
	}

}

App.printResult = function(data) {
	data = App.printResult.formatData(data);
	App.loadTemplate('find-result', {
		data: data
	}, "#find-result");
	if (data.length == 1) {
		var patientNum = data[0].num;
		App.search.patietnVisitList(patientNum, function(err, doc) {
			if (err) console.log(err);
			App.printResult.visitList(doc, patientNum);
		});
		var elem = document.getElementById("full-" + patientNum);
		elem.hidden = !elem.hidden;
	}
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

App.printResult.visitList = function(visits, numPatient) {
	// 1 - фэгдс, 2 - фибробронхоскопия, 3 - колоноскопия	
	var visits = visits;
	var typeNames = {
		"1": "фэгдс",
		"2": "фибробронхоскопия",
		"3": "колоноскопия"
	}
	visits.map(function(item) {
		item.typeName = typeNames[item.type];
		return item;
	});

	App.loadTemplate('visit-list', {
		data: visits
	}, "#full-" + numPatient);
}


App.search = function(str, cb) {
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

App.search.patietnVisitList = function(numPatient, cb) {
	Visit.find({
		num: parseInt(numPatient)
	}).exec(function(err, docs) {
		if (err) {
			console.log(err);
			cb(err, null);
		}
		cb(null, docs)
	});
}

App.openDoc = function(link) {
	var basePath = '../docs/doc/';
	gui.Shell.openItem(path.resolve(basePath, link));
}