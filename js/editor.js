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
	htmlpage: document.getElementById('htmlpage'),
	highlight: document.getElementById('highlight'),
	save: document.getElementById('save'),
	load: document.getElementById('load'),

	init: function() {
		input.style.overflow = 'hidden';
		this.loadData();
	},

	render: function() {
		var markedOutput = marked(this.input.value);
		overview.innerHTML = markedOutput.replace(/<table>/g, '<table class="table">');
		html.value = markedOutput;
		htmlpage.value = '<!DOCTYPE html>\n' +
		                 '<html>\n' +
		                 '<head>\n' +
		                 '<title>Document</title>\n' +
		                 '<meta charset="utf-8" />\n' +
		                 '<link rel="stylesheet" href="http://getbootstrap.com/2.3.2/assets/css/bootstrap.css" />\n' +
		                 '</head>\n' +
		                 '<body class="container">\n' +
		                 markedOutput.replace(/<table>/g, '<table class="table">') +
		                 '</body>\n' +
		                 '</html>';
		Prism.highlightAll();
	},

	insertTag: function(tagType) {
		var scroll   = this.input.scrollTop,
		    startTag = null,
		    endTag   = null;
		this.input.focus();

		if (window.ActiveXObject) {
			var textRange = document.selection.createRange(),
			    currentSelection = textRange.text;
		} else {
			var startSelection   = this.input.value.substring(0, this.input.selectionStart),
			    currentSelection = this.input.value.substring(this.input.selectionStart, this.input.selectionEnd),
			    endSelection     = this.input.value.substring(this.input.selectionEnd);
		}

		if (tagType) {
			if (tagType == 'image') {
				var image = true;
				tagType = 'link';
			}
			switch (tagType) {
				case 'bold':
					startTag = endTag = '**';
				break;
				case 'italic':
					startTag = endTag = '*';
				break;
				case 'link':
					if (currentSelection) {
						if (currentSelection.indexOf('http://') == 0
							|| currentSelection.indexOf('https://') == 0
							|| currentSelection.indexOf('ftp://') == 0
							|| currentSelection.indexOf('www.') == 0)
						{
							var label = prompt('Label?') || '';
							startTag  = '[' + label + '](';
							endTag    = ')';
						} else {
							var URL  = prompt('URL?');
							startTag = '[';
							endTag   = '](' + URL + ')';
						}
					} else {
						var URL   = prompt('URL?') || '';
						var label = prompt('Label?') || '';
						startTag  = '[';
						endTag    = '](' + URL + ')';
						currentSelection = label;
					}
				break;
			}
			if (image) {
				startTag = '!' + startTag;
			}
		}

		if (window.ActiveXObject) {
			textRange.text = startTag + currentSelection + endTag;
			textRange.moveStart("character", -endTag.length - currentSelection.length);
			textRange.moveEnd("character", -endTag.length);
			textRange.select();
		} else {
			this.input.value = startSelection + startTag + currentSelection + endTag + endSelection;
			this.input.focus();
			this.input.setSelectionRange(startSelection.length + startTag.length, startSelection.length + startTag.length + currentSelection.length);
		}

		this.input.scrollTop = scroll;
		this.render();
	},

	saveData: function() {
		localStorage.setItem('save', input.value);
		load.disabled = (localStorage.getItem('save') ? false : true);
		alert('Data saved successfully!')
	},

	loadData: function() {
		if (localStorage.getItem('save')) {
			input.value = localStorage.getItem('save');
			this.render();
			this.resizeInput();
		}
	},

	resizeInput: function() {
		var offset = input.offsetHeight - input.clientHeight;
		input.style.height = 'auto';
		input.style.height = (input.scrollHeight + offset) + 'px';
	}
};

// Tags
Mousetrap.bind('alt+b', function() {
	MarkdownEditor.insertTag('bold');
});

Mousetrap.bind('alt+i', function() {
	MarkdownEditor.insertTag('italic');
});

Mousetrap.bind('alt+l', function() {
	MarkdownEditor.insertTag('link');
});

Mousetrap.bind('alt+p', function() {
	MarkdownEditor.insertTag('image');
});

// Auto-preview and resizing
MarkdownEditor.input.onkeyup = function(e) {
	MarkdownEditor.render();
};

// Resizing
MarkdownEditor.input.onchange = MarkdownEditor.input.onpaste = MarkdownEditor.input.oncut = function() {
	MarkdownEditor.resizeInput();
};

// "Select all" button
MarkdownEditor.highlight.onfocus = function() {
	MarkdownEditor.input.select();
};

// "Save" button
MarkdownEditor.save.onclick = function() {
	MarkdownEditor.saveData();
};

Mousetrap.bind('alt+s', function() {
	MarkdownEditor.saveData();
});

// "Load" button
MarkdownEditor.load.onclick = function() {
	MarkdownEditor.loadData();
};

// On load
(function() {
	if (!localStorage) {
		MarkdownEditor.load.disabled = MarkdownEditor.save.disabled = true;
	} else {
		if (!localStorage.getItem('save'))
			MarkdownEditor.load.disabled = true;
	}
	MarkdownEditor.init();
	MarkdownEditor.render();
	MarkdownEditor.resizeInput();
})();