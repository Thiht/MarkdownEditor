if (!String.prototype.escapeHtml) {
	String.prototype.escapeHtml = function() {
		return this.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	};
}

// Internal variables and methods
var MarkdownEditor = {

	input: document.getElementById('input'),
	overview: document.getElementById('overview'),
	html: document.getElementById('html'),
	highlight: document.getElementById('highlight'),
	clear: document.getElementById('clear'),
	save: document.getElementById('save'),
	load: document.getElementById('load'),
	doc: null,

	render: function() {
		var markedOutput = marked(this.input.value);
		overview.innerHTML = markedOutput.replace(/<table>/g, '<table class="table">');
		html.innerHTML = markedOutput.escapeHtml();
	},

	generatePDF: function() {
		MarkdownEditor.doc = new jsPDF();
		MarkdownEditor.doc.fromHTML(MarkdownEditor.overview.innerHTML, 15, 15, {'elementHandlers': {}});
		document.getElementById('pdf-download').onclick = function() {
			MarkdownEditor.doc.save('MarkdownDocument.pdf');
		};
		//$('#pdf-overview').attr('src', MarkdownEditor.doc.output('datauristring'));
	}
};

// Auto-preview
MarkdownEditor.input.onkeyup = function() {
	MarkdownEditor.render();
};

MarkdownEditor.input.onchange = function() {
	MarkdownEditor.generatePDF();
};

// "Select all" button
MarkdownEditor.highlight.onfocus = function() {
	MarkdownEditor.input.select();
};

// "Clear" button
MarkdownEditor.clear.onclick = function() {
	MarkdownEditor.input.value = '';
	MarkdownEditor.render();
};

// "Save" button
MarkdownEditor.save.onclick = function() {
	localStorage.setItem('save', MarkdownEditor.input.value);
	MarkdownEditor.load.disabled = (localStorage.getItem('save') ? false : true);
	alert('Data saved successfully!')
};

// "Load" button
MarkdownEditor.load.onclick = function() {
	MarkdownEditor.input.value = localStorage.getItem('save');
	MarkdownEditor.render();
};

// On load
(function() {
	if(!localStorage) {
		MarkdownEditor.load.disabled = MarkdownEditor.save.disabled = true;
	} else {
		if (!localStorage.getItem('save'))
			MarkdownEditor.load.disabled = true;
	}
	MarkdownEditor.render();
	MarkdownEditor.generatePDF();
})();
