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
		Prism.highlightAll();
	},

	generatePDF: function() {
		MarkdownEditor.doc = new jsPDF();
		MarkdownEditor.doc.fromHTML(MarkdownEditor.overview.innerHTML, 15, 15, {'elementHandlers': {}});
		// save() doesn't work if output('datauristring') is called before
		/*document.getElementById('pdf-download').onclick = function() {
			MarkdownEditor.doc.save('MarkdownDocument.pdf');
		};*/
		document.getElementById('pdf-overview').src = MarkdownEditor.doc.output('datauristring');
	},

	insertTag: function(startTag, endTag, tagType) {
		var scroll = this.input.scrollTop;
		this.input.focus();

		if (window.ActiveXObject) {
			var textRange = document.selection.createRange(),
			    currentSelection = textRange.text;

			textRange.text = startTag + currentSelection + endTag;
			textRange.moveStart("character", -endTag.length - currentSelection.length);
			textRange.moveEnd("character", -endTag.length);
			textRange.select();
		} else {
			var startSelection   = this.input.value.substring(0, this.input.selectionStart),
			    currentSelection = this.input.value.substring(this.input.selectionStart, this.input.selectionEnd),
			    endSelection     = this.input.value.substring(this.input.selectionEnd);

			this.input.value = startSelection + startTag + currentSelection + endTag + endSelection;
			this.input.focus();
			this.input.setSelectionRange(startSelection.length + startTag.length, startSelection.length + startTag.length + currentSelection.length);
		}
		this.input.scrollTop = scroll;
		this.render();
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
	MarkdownEditor.generatePDF();
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
	MarkdownEditor.generatePDF();
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