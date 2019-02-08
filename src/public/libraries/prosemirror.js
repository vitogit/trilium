const {EditorState, Plugin, TextSelection} = require("prosemirror-state")
const {EditorView} = require("prosemirror-view")
const {Schema, DOMParser} = require("prosemirror-model")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes, sinkListItem, liftListItem, splitListItem} = require("prosemirror-schema-list")
const {exampleSetup} = require("prosemirror-example-setup")
  const {keymap} = require("prosemirror-keymap")

let statsPlugin = new Plugin({
  state: {
    init(_, {doc}) { console.log('text', doc.textContent); return showStats(doc.textContent) },
    apply(tr, old) { return tr.docChanged ? showStats(tr.doc.textContent) : old }
  }
})

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

let newKeymap = keymap({
  'Shift-Tab': liftListItem(mySchema.nodes.list_item),
  'Tab': sinkListItem(mySchema.nodes.list_item)
})

window.prosemirrorview = new EditorView(document.querySelector("#note-detail-text"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(""),
    plugins: exampleSetup({schema: mySchema}).concat(newKeymap).concat(statsPlugin)
  })
})

function showStats(text) {
  console.log("text.length________",text.length)
}