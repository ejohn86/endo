var mammoth = require("mammoth");
var fs = require('fs');

mammoth.convertToHtml({path: "6877.docx"})
    .then(function(result){
        var html = result.value; // The generated HTML
		console.log(html);
		fs.writeFileSync(__dirname+"/output.html",html);
        var messages = result.messages; // Any messages, such as warnings during conversion
    })
    .done();

mammoth.extractRawText({path: "6877.docx"})
	.then(function(result){
		console.log(result);
	}).done();