import {EditorState, Plugin} from 'prosemirror-state'
import {EditorView} from 'prosemirror-view'
import {Schema, DOMParser} from 'prosemirror-model'
import {schema, marks} from 'prosemirror-schema-basic'
import {addListNodes, sinkListItem, liftListItem, splitListItem} from 'prosemirror-schema-list'
import {exampleSetup, buildMenuItems} from 'prosemirror-example-setup'
import {keymap} from 'prosemirror-keymap'
import {inputRules, InputRule} from 'prosemirror-inputrules'
import {MenuItem} from 'prosemirror-menu'
import {toggleMark} from 'prosemirror-commands'
import {statsPlugin} from './stats-plugin.js'
import {savePlugin} from './save-plugin.js'

const supportedColors = ["yellow", "lime", "red", ]
const colorMarks = {}
supportedColors.forEach(function (color) {
  return colorMarks[color] = createColorMark(color, supportedColors);
});

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: { ...marks, ...colorMarks }
})

// =================================================
// HIGHLIGHT TODO transform to a plugin
// =================================================
function cmdItem(cmd, options) {
  var passedOptions = {
    label: options.title,
    run: cmd
  };

  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }

  if ((!options.enable || options.enable === true) && !options.select) passedOptions[options.enable ? "enable" : "select"] = function (state) {
    return cmd(state);
  };
  return new MenuItem(passedOptions);
}

function markActive(state, type) {
  var _state$selection = state.selection,
      from = _state$selection.from,
      $from = _state$selection.$from,
      to = _state$selection.to,
      empty = _state$selection.empty;
  if (empty) return type.isInSet(state.storedMarks || $from.marks());else return state.doc.rangeHasMark(from, to, type);
}

function markItem(markType, options) {
  var passedOptions = {
    active: function active(state) {
      return markActive(state, markType);
    },
    enable: true
  };

  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }

  return cmdItem(toggleMark(markType), passedOptions);
}

function createColorMark(color, colors) {
  return {
    attrs: {
      style: {
        default: "background-color: ".concat(color, ";")
      }
    },
    excludes: colors.join(" "),
    parseDOM: [{
      style: "background-color=".concat(color),
      attrs: {
        style: "background-color: ".concat(color)
      }
    }],
    toDOM: function toDOM(node) {
      return ["span", {
        style: node.attrs.style
      }, 0];
    }
  };
}

var menu = buildMenuItems(mySchema);

function createColorMenuItem(color) {
  return markItem(mySchema.marks[color], {
    title: "Toggle strong style",
    label: color
  });
}

supportedColors.forEach(function (color) {
  return menu.blockMenu[0].push(createColorMenuItem(color));
});
// =================================================
// HIGHLIGHT
// =================================================

const rules = [
  new InputRule(/aaa$/, 'Vito'),

  new InputRule(
    /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?) $/,
    function(pm, match, start, end) {
      const url = match[1];
      let link = mySchema.marks.link.create({
        href : url
      })
      return pm.tr.addMark(start, end, link);
    }
  )
];

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
      plugins:  exampleSetup({schema: mySchema, menuContent: menu.fullMenu}).concat(statsPlugin).concat(newKeymap).concat(savePlugin).concat(inputRules({rules}))
    })
    window.prosemirrorview.updateState(state)
}

window.prosemirrorview = new EditorView(document.querySelector("#note-detail-text"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(""),
    plugins: exampleSetup({schema: mySchema, menuContent: menu.fullMenu}).concat(statsPlugin).concat(newKeymap).concat(savePlugin).concat(inputRules({rules}))
  })
})

prosemirrorview.loadContent = loadContent

prosemirrorview.getContent = function() {
  console.log("getcontent")
  return JSON.stringify(window.prosemirrorview.state.doc.toJSON());
}

