var App = {};

App.init = function() {
	App.loadTemplate('app', {
		title: 'Привет'
	}, "#main-view")
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