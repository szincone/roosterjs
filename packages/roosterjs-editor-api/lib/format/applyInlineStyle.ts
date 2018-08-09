import { ChangeSource, NodeType, PositionType } from 'roosterjs-editor-types';
import { IEditor } from 'roosterjs-editor-core';
import { applyTextStyle, getTagOfNode } from 'roosterjs-editor-dom';

/**
 * Apply inline style to current selection
 * @param callback The callback function to apply style
 */
export default function applyInlineStyle(editor: IEditor, callback: (element: HTMLElement) => any) {
    editor.focus();
    let range = editor.getSelectionRange();

    if (range && range.collapsed) {
        let tempNode = range.startContainer;
        let ZWS = '\u200B';
        let isZWSNode =
            tempNode &&
            tempNode.nodeType == NodeType.Text &&
            tempNode.nodeValue == ZWS &&
            getTagOfNode(tempNode.parentNode) == 'SPAN';

        if (!isZWSNode) {
            editor.addUndoSnapshot();
            // Create a new text node to hold the selection.
            // Some content is needed to position selection into the span
            // for here, we inject ZWS - zero width space
            tempNode = editor.getDocument().createTextNode(ZWS);
            range.insertNode(tempNode);
        }

        applyTextStyle(tempNode, callback);
        editor.select(tempNode, PositionType.End);
    } else {
        // This is start and end node that get the style. The start and end needs to be recorded so that selection
        // can be re-applied post-applying style
        editor.addUndoSnapshot(() => {
            let firstNode: Node;
            let lastNode: Node;
            let contentTraverser = editor.getSelectionTraverser();
            let inlineElement = contentTraverser && contentTraverser.currentInlineElement;
            while (inlineElement) {
                let nextInlineElement = contentTraverser.getNextInlineElement();
                inlineElement.applyStyle(element => {
                    callback(element);
                    firstNode = firstNode || element;
                    lastNode = element;
                });
                inlineElement = nextInlineElement;
            }
            if (firstNode && lastNode) {
                editor.select(firstNode, PositionType.Before, lastNode, PositionType.After);
            }
        }, ChangeSource.Format);
    }
}
