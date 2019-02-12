import {Plugin} from "prosemirror-state"

export const  savePlugin = new Plugin({
  state: {
    init(_, {doc}) { return console.log('loaded') },
    apply(tr, old) { return tr.docChanged ? window.glob.noteChanged() : old }
  }
})
