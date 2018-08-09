import { IEditor } from 'roosterjs-editor-core';

let editor: IEditor;

export default function getCurrentEditor(): IEditor {
    return editor;
}

export function setCurrentEditor(newEditor: IEditor) {
    if (editor) {
        editor.dispose();
    }
    editor = newEditor;
}
