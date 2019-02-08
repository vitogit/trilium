import libraryLoader from "./library_loader.js";
import noteDetailService from './note_detail.js';
import treeService from './tree.js';
import attributeService from "./attributes.js";

const $component = $('#note-detail-text');

let textEditor = null;

// TODO Prosemirror plugins, move them to another place
let statsPlugin = new Plugin({
  state: {
    init(_, {doc}) { return showStats(doc.textContent) },
    apply(tr, old) { return tr.docChanged ? showStats(tr.doc.textContent) : old }
  }
})

let savePlugin = new Plugin({
  state: {
    init(_, {doc}) { return console.log('loaded') },
    apply(tr, old) { return tr.docChanged ? noteDetailService.noteChanged() : old }
  }
})

async function show() {
    // onNoteChange(noteDetailService.noteChanged);
    // isReadOnly = await isReadOnly();

    let content = noteDetailService.getCurrentNote().content
    let parsedContent, doc
    
    // TODO This is to support both html and parsed json. Just to test with the current data.
    // In the future will be all json parsed and serialized
    try {
      parsedContent = JSON.parse(noteDetailService.getCurrentNote().content)
      doc = mySchema.nodeFromJSON(parsedContent)
    } catch (e) {
      const element = document.createElement('div')
      element.innerHTML = content.trim()
      $('<div/>').html(content.trim())
      doc = DOMParser.fromSchema(mySchema).parse(element)
    }
    
    // TODO improve the way to load the doc
    let state = EditorState.create({
      doc: doc,
      // editable: !isReadOnly,
      plugins: exampleSetup({schema: mySchema}).concat(newKeymap).concat(savePlugin).concat(statsPlugin)
    })
    window.prosemirrorview.updateState(state)
}

function getContent() {
    return JSON.stringify(window.prosemirrorview.state.doc.toJSON());
}

async function isReadOnly() {
    const attributes = await attributeService.getAttributes();

    return attributes.some(attr => attr.type === 'label' && attr.name === 'readOnly');
}

function focus() {
    $component.focus();
}

function getEditor() {
    return textEditor;
}

function onNoteChange(func) {
    // textEditor.model.document.on('change:data', func);
}

$component.on("dblclick", "img", e => {
    const $img = $(e.target);
    const src = $img.prop("src");

    const match = src.match(/\/api\/images\/([A-Za-z0-9]+)\//);

    if (match) {
        const noteId = match[1];

        treeService.activateNote(noteId);
    }
    else {
        window.open(src, '_blank');
    }
});

export default {
    show,
    getEditor,
    getContent,
    focus,
    onNoteChange,
    cleanup: () => {
        if (textEditor) {
            textEditor.setData('');
        }
    },
    scrollToTop: () => $component.scrollTop(0)
}