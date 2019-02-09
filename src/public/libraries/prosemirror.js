const {EditorState, Plugin, TextSelection} = require("prosemirror-state")
const {EditorView} = require("prosemirror-view")
const {Schema, DOMParser} = require("prosemirror-model")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes, sinkListItem, liftListItem, splitListItem} = require("prosemirror-schema-list")
const {exampleSetup} = require("prosemirror-example-setup")
const {keymap} = require("prosemirror-keymap")

function showStats(text) {
  console.log("text.length________",text.length)
}

let statsPlugin = new Plugin({
  state: {
    init(_, {doc}) { return showStats(doc.textContent) },
    apply(tr, old) { return tr.docChanged ? showStats(tr.doc.textContent) : old }
  }
})

let savePlugin = new Plugin({
  state: {
    init(_, {doc}) { return console.log('loaded') },
    apply(tr, old) { return tr.docChanged ? window.glob.noteChanged() : old }
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

function loadContent( content ) {
    let parsedContent, doc

    // TODO This is to support both html and parsed json. Just to test with the current data.
    // In the future will be all json parsed and serialized
    try {
      parsedContent = JSON.parse(content)
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
      plugins: exampleSetup({schema: mySchema}).concat(newKeymap).concat(statsPlugin).concat(savePlugin)
    })
    window.prosemirrorview.updateState(state)
}

window.prosemirrorview = new EditorView(document.querySelector("#note-detail-text"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(""),
    plugins: exampleSetup({schema: mySchema}).concat(newKeymap)
  })
})

prosemirrorview.loadContent = loadContent

prosemirrorview.getContent = function() {
  console.log("getcontent")
  return JSON.stringify(window.prosemirrorview.state.doc.toJSON());
}
