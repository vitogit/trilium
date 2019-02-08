import libraryLoader from "./library_loader.js";
import noteDetailService from './note_detail.js';
import treeService from './tree.js';
import attributeService from "./attributes.js";

const $component = $('#note-detail-text');

let textEditor = null;

async function show() {
    // onNoteChange(noteDetailService.noteChanged);
    // isReadOnly = await isReadOnly();
    let content = noteDetailService.getCurrentNote().content
    const element = document.createElement('div')
    element.innerHTML = content.trim()
    $('<div/>').html(content.trim())
    
    // TODO improve the way to load the doc
    let state = EditorState.create({
      doc: DOMParser.fromSchema(mySchema).parse(element),
      // editable: !isReadOnly,
      plugins: exampleSetup({schema: mySchema}).concat(newKeymap).concat(statsPlugin)
    })
    window.prosemirrorview.updateState(state)
}

function getContent() {
    let content = textEditor.getData();

    // if content is only tags/whitespace (typically <p>&nbsp;</p>), then just make it empty
    // this is important when setting new note to code
    if (jQuery(content).text().trim() === '' && !content.includes("<img")) {
        content = '';
    }

    return content;
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