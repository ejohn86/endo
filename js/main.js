var gui = require("nw.gui");
var win = gui.Window.get();
var path = require('path');
var async = require('async');
var mammoth = require("mammoth");
var fs = require('fs');
var _ = require('underscore');
var Docxtemplater = require('docxtemplater');
win.showDevTools();
// console.log(1)

var App = {};
var Pat = require('./js/db.js').Pat;
var Visit = require('./js/db.js').Visit;

// var nwPath = path.dirname(process.execPath);
var nwPath = process.cwd();
App.currentValue = '';
App.currentModal = '';
App.baseDocsPath = path.resolve(nwPath, '../docs/doc/');
App.templatePath = path.resolve(nwPath, '../docs/shab/');
// App.templateHeaderPath = path.resolve(App.templatePath, './headers/');
// App.templateContentPath = path.resolve(App.templatePath, './content/');
App.templateHeaderPath = path.resolve(nwPath,  './tmp/tmpl/headers/');
App.templateContentPath = path.resolve(nwPath, './tmp/tmpl/content/');
console.log(App.templateHeaderPath);
console.log(App.templateContentPath);
App.templateList = {};
App.currentPatient = {};
// defer request for fast change finded value
App.onChangeInterval = null;
App.deferRequestBy = 300;



App.init = function() {

	App.templateList.content = fs.readdirSync(App.templateContentPath)
		.filter(function(item) {
			return ~item.indexOf('docx');
		})
		.map(function(item) {
			return item.replace('.docx', '');
		});
	App.templateList.headers = fs.readdirSync(App.templateHeaderPath)
		.filter(function(item) {
			return ~item.indexOf('docx');
		})
		.map(function(item) {
			return item.replace('.docx', '');
		});
	console.log(App.templateList);
	App.loadTemplate('app', {
		version: require('./package.json').version
	}, "#main-view");
}

window.onload = function() {
	App.init();
	App.events();
	App.botstrapHints();
	App.registerHotkeys();
	//App.test();
	gui.Window.get().show();
}

App.loadTemplate = function(view, data, target) {
	var swig = require('swig'),
		fileName = 'view/' + view + '.html';
	swig.setDefaults({
		autoescape: false
	});
	var template = swig.renderFile(fileName, data || {});
	// console.log(template);
	if (target)
		return $(target).html(template);
	return template;
};

App.test = function() {

	var contetnDocxFile = path.resolve(nwPath, './tmp/headers/' , '2.txt');
	var file1 = path.resolve(nwPath, './tmp/headers/' , '1_3.docx');
	var file2 = path.resolve(nwPath, './tmp/headers/' , '2_3.docx');

	console.log(contetnDocxFile);
	var xml = fs.readFileSync(contetnDocxFile).toString();
	console.log(xml);

	var content = fs.readFileSync(file1, "binary")

	doc = new Docxtemplater(content);
	// console.log(doc);
	//set the templateVariables
	doc.setData({
		"rawXml": xml
	});

	//apply them (replace all occurences of {first_name} by Hipp, ...)
	doc.render();
	var buf = doc.getZip()
		.generate({
			type: "nodebuffer"
		});
	fs.writeFileSync(file2, buf);


}

App.botstrapHints = function() {
	//tooltips init
	$('span[data-toggle="tooltip"]').tooltip({
		animated: 'fade'
	});

	//autofocus hack for modal	
	$(document).on('shown.bs.modal', '.modal', function() {
		$(this).find('[autofocus]').focus();
	});

	$(document).on('hidden.bs.modal', '.modal', function() {
		App.currentModal = '';
	});
}

App.registerHotkeys = function() {


	document.onkeydown = function(e) {
		// New patient (Ctrl+N)
		if (e.ctrlKey && e.keyCode == 'N'.charCodeAt(0) && !e.shiftKey) {
			App.newPatient();
			return false;
		}

		if (e.ctrlKey && e.keyCode === 13 && !e.shiftKey) {
			console.log('App.currentModal: %s', App.currentModal);
			if (App.currentModal == 'edit-patient') {
				App.savePatient(document.getElementById('save-button-patient'));
			}
			return false;
		}

	};
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
			// console.log(event.target);
			var target = event.target;
			if (target.id == "find-result" || target.tagName == "TBODY" || target.hasAttribute('data-edit-btn')) return;
			while (target.tagName != 'TR') {
				target = target.parentNode;
			}
			var id = target.getAttribute('data-toggle-id');
			if (!id) return;

			App.search.patietnVisitList(id, function(err, doc) {
				if (err) console.log(err);
				App.printResult.visitList(doc, id);

			});
			var elem = document.getElementById("full-" + id);
			//$(elem).fadeToggle("slow");

			//$(elem).collapse('toggle');
			elem.hidden = !elem.hidden;

		}


		document.onclick = function(event) {
			var target = event.target;
			// open doc
			if (target.hasAttribute('data-doc-link')) {
				console.log('data-doc-link click');
				var link = target.getAttribute('data-doc-link');
				App.openDoc(link);
			};
			if (target.hasAttribute('data-doc-link-full')) {
				console.log('data-doc-link-full click');
				var link = target.getAttribute('data-doc-link-full');
				App.openDoc(link, true);
			}
			//browse visit doc
			if (target.hasAttribute('data-doc-link-browse')) {
				var link = target.getAttribute('data-doc-link-browse');
				var id = target.getAttribute('data-id-visit');
				App.browseDocFormat(link, id);
			}
			// new patient
			if (target.hasAttribute('data-new-patient')) {
				App.newPatient();
			}
			// edit patient
			if (target.hasAttribute('data-edit-btn')) {
				App.editPatient(target.getAttribute('data-edit-btn'));

			}

			// save edit data of patient
			if (target.hasAttribute('data-save-button-patient')) {
				App.savePatient(target);
			}

			if (target.hasAttribute('data-save-visit')) {
				App.saveVisit();
			}

			// new visit btn
			if (target.hasAttribute('data-new-visit-button')) {
				var numPatient = target.getAttribute('data-new-visit-button')
				App.newVisit(numPatient);
			}

			// delete visit
			if (target.hasAttribute('data-delete-visit')) {
				var delId = target.getAttribute('data-delete-visit');
				App.delVisit(delId);
			}

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
	// upper case first letter fio
ucFirst = function(str) {
	return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

App.printResult = function(data) {
	data = data.map(function(item) {
		item.fn = ucFirst(item.fn);
		item.sn = ucFirst(item.sn);
		item.tn = ucFirst(item.tn);
		return item;
	});

	// add count data to patient list
	async.map(data, function(item, cb) {
			App.search.visitCount(item.num, function(err, count) {
				if (err) {
					console.log(err);
					cb(err, null);
				}
				item.count = count;
				cb(null, item);
			});
		},
		function(err, data) {
			//render result
			App.loadTemplate('find-result', {
				data: data
			}, "#find-result");
			// print visit list if find result is once
			if (data.length == 1) {
				var patientNum = data[0].num;
				App.search.patietnVisitList(patientNum, function(err, doc) {
					if (err) console.log(err);
					App.printResult.visitList(doc, patientNum);
				});
				var elem = document.getElementById("full-" + patientNum);
				elem.hidden = !elem.hidden;
				//$(elem).collapse('toggle');
			}
		});
}

App.printResult.visitList = function(visits, numPatient) {
	var visits = visits;
	var typeNames = {
		"1": "ФГДС",
		"2": "фибробронхоскопия",
		"3": "колоноскопия"
	}
	var styleList = ['success', 'primary', 'warning'];

	visits.map(function(item) {
		item.typeName = typeNames[item.type];
		item.style = styleList[parseInt(item.type) - 1];
		return item;
	});

	App.loadTemplate('visit-list', {
		data: visits,
		numPatient: numPatient
	}, "#full-" + numPatient);
}


App.search = function(str, cb) {
	var str = str || document.getElementById('find-input').value || '';
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
			findObj.sn = new RegExp('^' + searchArr[1], 'i'); // возможность искать по инициалам
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
				// console.log(docs.length);
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
		docs.sort(function(a, b) {
			var aDate = a.time || new Date(parseInt(a.date.split('.')[2]), parseInt(a.date.split('.')[1]) - 1, parseInt(a.date.split('.')[0]));
			var bDate = b.time || new Date(parseInt(b.date.split('.')[2]), parseInt(b.date.split('.')[1]) - 1, parseInt(b.date.split('.')[0]));
			// var aDate = a.date,
			// 	bDate = b.date;parseInt(aDate.split('.')[2])
			// var aDateInt = parseInt(aDate.split('.')[2] + aDate.split('.')[1] + aDate.split('.')[0]);
			// var bDateInt = parseInt(bDate.split('.')[2] + bDate.split('.')[1] + bDate.split('.')[0]);
			return bDate - aDate;
		});
		cb(null, docs)
	});
}

// return count visits group by type visit
App.search.visitCount = function(numPatient, cb) {
	App.search.patietnVisitList(numPatient, function(err, docs) {
		if (err) {
			console.log(err);
			cb(err, null);
		}
		var result = docs.reduce(function(sum, current) {
			sum[parseInt(current.type) - 1]++;
			return sum;
		}, [0, 0, 0])
		cb(null, result);

	});
}

App.openDoc = function(link, isAbsolut) {
	if (isAbsolut) {
		gui.Shell.openItem(link);
	}
	gui.Shell.openItem(path.resolve(App.baseDocsPath, link));
}

/*App.browseDoc = function(link) {
	var absLink = path.resolve(App.baseDocsPath, link);
	// console.log(absLink);
	mammoth.convertToHtml({
			path: absLink
		})
		.then(function(result) {
			var html = result.value; // The generated HTML
			//var format = App.browseDoc.format(html);
			App.loadTemplate('browse-doc', {
				data: html,
				link: absLink,
			}, "#modal-doc");
			$('#myModal').modal('toggle');
			App.currentModal = 'browse-doc';
			//fs.writeFileSync(__dirname + "/output.html", html);
			var messages = result.messages; // Any messages, such as warnings during conversion
		}).done();
}*/

App.browseDocFormat = function(link, id) {
	var absLink = path.resolve(App.baseDocsPath, link);
	fs.stat(absLink, function(err, stat) {
		//file is exist
		if (err == null) {
			mammoth.extractRawText({
					path: absLink
				})
				.then(function(result) {
					var text = result.value; // The generated HTML

					//console.log(html);
					var arr = text.split(/\n{4}/);

					arr.forEach(function(item, i, arr) {
						arr[i] = item.split(/\s*\n{2}\s*/)
							.filter(function(item) {
								return item.length
							})
							.map(function(item) {
								return item.trim();
							});
					});
					var html = '';

					arr.forEach(function(item, i, arr) {
						html += '<p>' + item.join('<br>') + '</p>';
					});
					printModal(html);
					var messages = result.messages; // Any messages, such as warnings during conversion
				}).done();
			// file not found	
		} else if (err.code == 'ENOENT') {
			console.log('File not found: %s', absLink);
			printModal('Файл не найден');

		} else {
			console.log('Some other error: ', err.code);
			printModal('Файл не найден');
		}
	});

	printModal = function(text) {
		App.loadTemplate('browse-doc', {
			data: text,
			link: absLink,
			id: id
		}, "#modal-doc");
		$('#browse-doc-id').modal('toggle');
		App.currentModal = 'browse-doc';
	}


}

App.modalFormEvents = function() {
	var $targets = $('#myForm').find('input, button'),
		steps = $targets.map(function() {
			return $(this).attr('tabindex');
		}).get();
	$('#myForm').on('keypress', 'input', function(e) {
		if (e.keyCode == 13) {
			var current = parseInt($(this).attr('tabindex')),
				next = (current + 1) % steps.length;
			// next = steps[++current % steps.length];
			// hack for radio
			if (current == 5 || current == 6) {
				next = 7
			}
			$targets.filter('[tabindex="' + next + '"]').focus();
		}
	});
}

App.newPatient = function() {
	var inp = document.getElementById('find-input');
	var doc = {};
	if (inp.value.length) {
		var val = inp.value.split(" ");
		doc.fn = val[0];
		doc.sn = val[1] || "";
		doc.tn = val[2] || "";
	}
	// console.log('newPatient');
	App.loadTemplate('edit-patient', {
		"data": doc
	}, "#modal-doc");
	$('#edit-patietn-id').modal('toggle');
	App.currentModal = 'edit-patient';
	App.modalFormEvents();

}

App.editPatient = function(id) {
	// console.log('Edit patient: %s', id);
	Pat.findOne({
		num: parseInt(id)
	}, function(err, doc) {
		//doc = doc;
		doc.fn = ucFirst(doc.fn);
		doc.sn = ucFirst(doc.sn);
		doc.tn = ucFirst(doc.tn);
		var bArr = doc.birth.split('.');
		doc.birth = bArr[2] + '-' + bArr[1] + '-' + bArr[0];
		App.loadTemplate('edit-patient', {
			"data": doc,
			"edit": true
		}, "#modal-doc");
		$('#edit-patietn-id').modal('toggle');
		App.currentModal = 'edit-patient';
		App.modalFormEvents();
		// console.log(doc);
	});
}

//return true if validated or arr invalid filds
App.validatePatientForm = function() {
	var errDiv = document.getElementById('error-message');
	errDiv.innerHTML = '';
	//https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms/Data_form_validation
	//console.log($('input[name="gen"]:checked').val());
	if (document.getElementById('myForm').checkValidity()) {
		return true;
	}
	var validateArr = ['fn', 'birth', 'sn', 'tn', 'addr', 'gen'];
	var nameFields = {
		'fn': 'Фамилия',
		'birth': 'Дата рождения',
		'sn': 'Имя',
		'tn': 'Отчество',
		'addr': 'Адрес',
		'gen': 'Пол'
	};
	var notValidArr = [];
	validateArr.forEach(function(item, i, arr) {
		if (!document.getElementById(item + '-form').checkValidity()) {
			notValidArr.push(item);
		}
	});
	notValidArr = notValidArr.map(function(item) {
		return nameFields[item];
	});

	errDiv.innerHTML = "Заполните поля: <span class='red'>" + notValidArr.join(', ') + '</span>';
	console.log(false);
	return false;
}

App.getEditFormData = function() {
	var validateArr = ['fn', 'birth', 'sn', 'tn', 'addr'];
	var data = {}
	validateArr.forEach(function(item, i, arr) {
		data[item] = document.getElementById(item + '-form').value.trim();
	});
	data.gen = $('#gen-radio label.active input').val();
	var bArr = data.birth.split('-');
	data.birth = bArr[2] + '.' + bArr[1] + '.' + bArr[0];
	// console.log(data);
	return data;
}

App.savePatient = function(target) {
	console.log(target);
	if (App.validatePatientForm()) {
		$('#edit-patietn-id').modal('hide');
		// new patietn
		if (target.hasAttribute('data-num-patient')) {
			var num = parseInt(target.getAttribute('data-num-patient'));
			var formData = App.getEditFormData();
			var inp = document.getElementById('find-input');
			if (num === 0) {
				Pat.newPatient(formData, function() {
					inp.value = formData.fn + ' ' + formData.sn + ' ' + formData.tn;
					App.search(inp.value, function(err, res) {
						App.printResult(res);
					});
				});
			}
			// edit
			if (num > 0) {
				Pat.editPatient(num, App.getEditFormData(), function() {
					inp.value = formData.fn + ' ' + formData.sn + ' ' + formData.tn;
					App.search(document.getElementById('find-input').value, function(err, res) {
						App.printResult(res);
					});
				});
			}
		}
	}
}

App.newVisit = function(numPatient) {
	Pat.findOne({
		num: parseInt(numPatient)
	}, function(err, doc) {
		doc.fn = ucFirst(doc.fn);
		doc.sn = ucFirst(doc.sn);
		doc.tn = ucFirst(doc.tn);
		var bArr = doc.birth.split('.');
		doc.birth = bArr[2] + '-' + bArr[1] + '-' + bArr[0];
		App.currentPatient = doc;
		App.loadTemplate('new-visit', {
			"list": App.templateList.content,
			"headers": App.templateList.headers,
			"date": getFormatDate(),
			"doc": doc
		}, "#modal-doc");
		// listener for select-template
		var tempSelect = document.getElementById('template-select-form');
		tempSelect.onchange = function() {
			document.getElementById('data-save-btn').disabled = false;
			var fileName = tempSelect.options[tempSelect.selectedIndex].value + '.docx';
			App.browseTmpl(fileName);
		}
		$('#new-visit-id').modal('toggle');
		App.currentModal = 'new-visit';
	});
}


App.browseTmpl = function(tmplFile) {
	var absLink = path.resolve(App.templatePath, tmplFile);
	// console.log(absLink);
	mammoth.extractRawText({
			path: absLink
		})
		.then(function(result) {
			var html = result.value; // The generated HTML

			//console.log(html);
			var arr = html.split(/\n{4}/);

			//fs.writeFileSync(path.resolve(App.templatePath, 'html.txt'), html);
			// fs.writeFileSync(path.resolve(App.templatePath, 'tmp.txt'), arr.join('\n-------------------\n'));
			arr.forEach(function(item, i, arr) {
				arr[i] = item.split(/\s*\n{2}\s*/)
					.filter(function(item) {
						return item.length
					})
					.map(function(item) {
						return item.trim();
					});
			});
			var resultHtml = '';

			arr.forEach(function(item, i, arr) {
				resultHtml += '<p>' + item.join('<br>') + '</p>';
			});

			// fs.writeFileSync(path.resolve(App.templatePath, 'tmp2.txt'), JSON.stringify(arr));
			// fs.writeFileSync(path.resolve(App.templatePath, 'html2.txt'), resultHtml);

			$('#tmpl-content').html(resultHtml);
			var messages = result.messages; // Any messages, such as warnings during conversion
		}).done();
}

App.saveVisit = function() {
	console.log(JSON.stringify(App.currentPatient));
	console.log(App.getNewVisitFormData());
	var pat = App.currentPatient;

	var newVisit = {};
	var docname = App.getMaxDocName() + 1;
	console.log(docname);
	newVisit.num = App.currentPatient.num;
	newVisit.type = App.getNewVisitFormData().typevisit;
	newVisit.date = getFormatDate();
	newVisit.time = (new Date()).getTime();
	newVisit.link = newVisit.type + '/' + docname + '.docx';

	//insert into db
	Visit.insert(newVisit, function(err, newDoc) {
		console.log('new visit added');
		console.log(newDoc);
	});

	// reload visit list
	App.search.patietnVisitList(App.currentPatient.num, function(err, doc) {
		if (err) console.log(err);
		App.printResult.visitList(doc, App.currentPatient.num);
	});

	//save docx file
	var absTmplLink = path.resolve(App.templatePath, App.getNewVisitFormData().tmpl + '.docx');
	var absSavedDocLink = path.resolve(App.baseDocsPath, newVisit.link);
	// console.log(absTmplLink);
	// console.log(absSavedDocLink);
	var content = fs.readFileSync(absTmplLink, "binary")

	doc = new Docxtemplater(content);
	console.log(doc);
	//set the templateVariables
	var birth = pat.birth.split('-')[2] + '.' + pat.birth.split('-')[1] + '.' + pat.birth.split('-')[0];
	doc.setData({
		"fio": pat.fn + ' ' + pat.sn + ' ' + pat.tn,
		"date": getFormatDate(),
		"gen": pat.gen,
		"birth": birth,
		"addr": pat.addr
	});

	//apply them (replace all occurences of {first_name} by Hipp, ...)
	doc.render();
	var buf = doc.getZip()
		.generate({
			type: "nodebuffer"
		});
	fs.writeFileSync(absSavedDocLink, buf);
	$('#new-visit-id').modal('hide');
	App.openDoc(absSavedDocLink);


}

getFormatDate = function() {
	var today = new Date();

	var dd = today.getDate();
	if (dd < 10) dd = '0' + dd;

	var mm = today.getMonth() + 1;
	if (mm < 10) mm = '0' + mm;

	return dd + '.' + mm + '.' + today.getFullYear();
}

App.getNewVisitFormData = function() {
	var form = {};
	form.typevisit = $('#type-visit-radio label.active input').val();
	var tempSelect = document.getElementById('template-select-form');
	form.tmpl = tempSelect.options[tempSelect.selectedIndex].value;
	return form;
}

App.getMaxDocName = function() {
	var s = new Date();
	var tmpArr = [];
	for (var i = 1; i <= 3; i++) {
		tmpArr = tmpArr.concat(fs.readdirSync(path.resolve(App.baseDocsPath, i.toString())).map(function(item) {
			var num = parseInt(item.replace('.docx', ''));
			return (typeof(num) === 'number' && !isNaN(num)) ? num : 0;
		}))
	}
	return max = _.max(tmpArr);

}

App.delVisit = function(id) {
	console.log("Удаляем посещение: %s", id);
	Visit.findOne({
		_id: id
	}, function(err, doc) {
		// delete docx file
		console.log(doc);
		var absLink = path.resolve(App.baseDocsPath, doc.link);
		fs.stat(absLink, function(err, stat) {
			if (err == null) {
				fs.unlink(absLink, function(err) {
					console.log('File deleted: %s', absLink);
					delDb();
				});
			} else if (err.code == 'ENOENT') {
				console.log('File not found: %s', absLink);
				delDb();
			} else {
				console.log('Some other error: ', err.code);
				delDb();
			}
		});
		// delete from db
		delDb = function() {
			Visit.remove({
				_id: id
			}, {}, function(err, numRemoved) {
				console.log('del DB row: %s, num removed: %s', id, numRemoved);
				$('#browse-doc-id').modal('toggle');
				var inp = document.getElementById('find-input');
				var value = inp.value;
				App.search(value, function(err, res) {
					if (err) console.log(err);
					App.printResult(res);
				});

			});
		}

	});
}
