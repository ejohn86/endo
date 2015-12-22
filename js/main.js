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
	// console.log(template);
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
		if (inp.value.length > 3) {
			var inpValue = inp.value;
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
		//alert('Поиск пустой')
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

		/*Pat.find(findObj, function(err, docs) {
			if (err) {
				console.log(err);
				cb(err, null);
			}
			cb(null, docs)
				// alert(docs.length + ": " + t);
		});*/
		Pat.find(findObj).limit(10).exec(function(err, docs) {
			if (err) {
				console.log(err);
				cb(err, null);
			}
			cb(null, docs)
				// alert(docs.length + ": " + t);
		});
		// that = this;
		// that.onChangeInterval = null;
		//   	clearInterval(that.onChangeInterval);

		//       if (that.currentValue !== that.el.val()) {
		//           that.findBestHint();
		//           if (that.options.deferRequestBy > 0) {
		//               // Defer lookup in case when value changes very quickly:
		//               that.onChangeInterval = setInterval(function () {
		//                   that.onValueChange();
		//               }, that.options.deferRequestBy);
		//           } else {
		//               that.onValueChange();
		//           }
		//       }
		// https://github.com/devbridge/jQuery-Autocomplete/blob/master/dist/jquery.autocomplete.js
	}
}