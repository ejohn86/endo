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
	console.log(absTmplLink);
	console.log(absSavedDocLink);
	var content = fs.readFileSync(absTmplLink, "binary")

	doc = new Docxtemplater(content);
	console.log(doc);
	//set the templateVariables
	var birth = pat.birth.split('-')[2] + '.' + pat.birth.split('-')[1] + '.' + pat.birth.split('-')[0];
	var xml = fs.readFileSync('./tmp/headers/2.txt');
	// console.log(xml.toString());
	console.log(doc);
	doc.setData({
		"fio": pat.fn + ' ' + pat.sn + ' ' + pat.tn,
		"date": getFormatDate(),
		"gen": pat.gen,
		"birth": birth,
		"addr": pat.addr,
		"complexXml": xml.toString()
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
