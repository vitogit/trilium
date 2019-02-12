import {Plugin} from "prosemirror-state"

export const statsPlugin = new Plugin({
  state: {
    init(_, {doc}) { return console.log('loaded') },
    apply(tr, old) { return tr.docChanged ? showStats(tr.doc.textContent) : old }
  }
})

function showStats(text) {
  console.log("text.length________",text.length)
}
