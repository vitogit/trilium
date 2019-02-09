import libraryLoader from "./library_loader.js";
import noteDetailService from './note_detail.js';
import treeService from './tree.js';
import attributeService from "./attributes.js";

const $component = $('#note-detail-text');

let textEditor = null;

async function show() {
    // isReadOnly = await isReadOnly();
    let content = noteDetailService.getCurrentNote().content
    window.prosemirrorview.loadContent(content)
}

function getContent() {
    return window.prosemirrorview.getContent();
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
    cleanup: () => {
        if (textEditor) {
            textEditor.setData('');
        }
    },
    scrollToTop: () => $component.scrollTop(0)
}
