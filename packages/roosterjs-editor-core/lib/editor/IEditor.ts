import {
    ChangeSource,
    ContentPosition,
    DefaultFormat,
    InsertOption,
    PluginEvent,
    PositionType,
    QueryScope,
    Rect,
} from 'roosterjs-editor-types';
import {
    BlockElement,
    PositionContentSearcher,
    ContentTraverser,
    Position,
} from 'roosterjs-editor-dom';

/**
 * Core Editor interface. Use this file for plugins to break circular dependencies.
 */
interface IEditor {
    /**
     * Dispose this editor, dispose all plugins and custom data
     */
    dispose(): void;

    /**
     * Get whether this editor is disposed
     * @returns True if editor is disposed, otherwise false
     */
    isDisposed(): boolean;

    /**
     * Insert node into editor
     * @param node The node to insert
     * @param option Insert options. Default value is:
     *  position: ContentPosition.SelectionStart
     *  updateCursor: true
     *  replaceSelection: true
     *  insertOnNewLine: false
     * @returns true if node is inserted. Otherwise false
     */
    insertNode(node: Node, option?: InsertOption): boolean;

    /**
     * Delete a node from editor content
     * @param node The node to delete
     * @returns true if node is deleted. Otherwise false
     */
    deleteNode(node: Node): boolean;

    /**
     * Replace a node in editor content with another node
     * @param existingNode The existing node to be replaced
     * @param new node to replace to
     * @returns true if node is replaced. Otherwise false
     */
    replaceNode(existingNode: Node, toNode: Node): boolean;

    /**
     * Get BlockElement at given node
     * @param node The node to create InlineElement
     * @returns The BlockElement result
     */
    getBlockElementAtNode(node: Node): BlockElement;

    /**
     * Check if the node falls in the editor content
     * @param node The node to check
     * @returns True if the given node is in editor content, otherwise false
     */
    contains(node: Node): boolean;

    /**
     * Check if the range falls in the editor content
     * @param range The range to check
     * @returns True if the given range is in editor content, otherwise false
     */
    contains(range: Range): boolean;

    /**
     * Query HTML elements in editor by tag name
     * @param tag Tag name of the element to query
     * @param forEachCallback An optional callback to be invoked on each element in query result
     * @returns HTML Element array of the query result
     */
    queryElements<T extends keyof HTMLElementTagNameMap>(
        tag: T,
        forEachCallback?: (node: HTMLElementTagNameMap[T]) => any
    ): HTMLElementTagNameMap[T][];

    /**
     * Query HTML elements in editor by a selector string
     * @param selector Selector string to query
     * @param forEachCallback An optional callback to be invoked on each node in query result
     * @returns HTML Element array of the query result
     */
    queryElements<T extends HTMLElement = HTMLElement>(
        selector: string,
        forEachCallback?: (node: T) => any
    ): T[];

    /**
     * Query HTML elements with the given scope by tag name
     * @param tag Tag name of the element to query
     * @param scope The scope of the query, default value is QueryScope.Body
     * @param forEachCallback An optional callback to be invoked on each element in query result
     * @returns HTML Element list of the query result
     */
    queryElements<T extends keyof HTMLElementTagNameMap>(
        tag: T,
        scope: QueryScope,
        forEachCallback?: (node: HTMLElementTagNameMap[T]) => any
    ): HTMLElementTagNameMap[T][];

    /**
     * Query HTML elements with the given scope by a selector string
     * @param selector Selector string to query
     * @param scope The scope of the query, default value is QueryScope.Body
     * @param forEachCallback An optional callback to be invoked on each element in query result
     * @returns HTML Element array of the query result
     */
    queryElements<T extends HTMLElement = HTMLElement>(
        selector: string,
        scope: QueryScope,
        forEachCallback?: (node: T) => any
    ): T[];

    /**
     * Collapse nodes within the given start and end nodes to their common ascenstor node,
     * split parent nodes if necessary
     * @param start The start node
     * @param end The end node
     * @param canSplitParent True to allow split parent node there are nodes before start or after end under the same parent
     * and the returned nodes will be all nodes from start trhough end after splitting
     * False to disallow split parent
     * @returns When cansplitParent is true, returns all node from start through end after splitting,
     * otherwise just return start and end
     */
    collapseNodes(start: Node, end: Node, canSplitParent: boolean): Node[];

    /**
     * Check whether the editor contains any visible content
     * @param trim Whether trime the content string before check. Default is false
     * @returns True if there's no visible content, otherwise false
     */
    isEmpty(trim?: boolean): boolean;

    /**
     * Get current editor content as HTML string
     * @param triggerExtractContentEvent Whether trigger ExtractContent event to all plugins
     * before return. Use this parameter to remove any temporary content added by plugins.
     * @param includeSelectionMarker Set to true if need include selection marker inside the content.
     * When restore this content, editor will set the selection to the position marked by these markers
     * @returns HTML string representing current editor content
     */
    getContent(
        triggerExtractContentEvent?: boolean,
        includeSelectionMarker?: boolean
    ): string;

    /**
     * Get plain text content inside editor
     * @returns The text content inside editor
     */
    getTextContent(): string;

    /**
     * Set HTML content to this editor. All existing content will be replaced. A ContentChanged event will be triggered
     * @param content HTML content to set in
     * @param triggerContentChangedEvent True to trigger a ContentChanged event. Default value is true
     */
    setContent(content: string, triggerContentChangedEvent?: boolean): void;

    /**
     * Insert HTML content into editor
     * @param HTML content to insert
     * @param option Insert options. Default value is:
     *  position: ContentPosition.SelectionStart
     *  updateCursor: true
     *  replaceSelection: true
     *  insertOnNewLine: false
     */
    insertContent(content: string, option?: InsertOption): void;

    //#endregion

    //#region Focus and Selection

    /**
     * Get current selection range from Editor.
     * It does a live pull on the selection, if nothing retrieved, return whatever we have in cache.
     * @returns current selection range, or null if editor never got focus before
     */
    getSelectionRange(): Range;

    /**
     * Check if focus is in editor now
     * @returns true if focus is in editor, otherwise false
     */
    hasFocus(): boolean;

    /**
     * Focus to this editor, the selection was restored to where it was before, no unexpected scroll.
     */
    focus(): void;

    /**
     * Select content by range
     * @param range The range to select
     * @returns True if content is selected, otherwise false
     */
    select(range: Range): boolean;

    /**
     * Select content by Position and collapse to this position
     * @param position The position to select
     * @returns True if content is selected, otherwise false
     */
    select(position: Position): boolean;

    /**
     * Select content by a start and end position
     * @param start The start position to select
     * @param end The end position to select, if this is the same with start, the selection will be collapsed
     * @returns True if content is selected, otherwise false
     */
    select(start: Position, end: Position): boolean;

    /**
     * Select content by node
     * @param node The node to select
     * @returns True if content is selected, otherwise false
     */
    select(node: Node): boolean;

    /**
     * Select content by node and offset, and collapse to this position
     * @param node The node to select
     * @param offset The offset of node to select, can be a number or value of PositionType
     * @returns True if content is selected, otherwise false
     */
    select(node: Node, offset: number | PositionType): boolean;

    /**
     * Select content by start and end nodes and offsets
     * @param startNode The node to select start from
     * @param startOffset The offset to select start from
     * @param endNode The node to select end to
     * @param endOffset The offset to select end to
     * @returns True if content is selected, otherwise false
     */
    select(
        startNode: Node,
        startOffset: number | PositionType,
        endNode: Node,
        endOffset: number | PositionType
    ): boolean;

    /**
     * Insert selection marker element into content, so that after doing some modification,
     * we can still restore the selection as long as the selection marker is still there
     * @returns The return value of callback
     */
    runWithSelectionMarker<T>(callback: () => T, useInlineMarker?: boolean): T;

    /**
     * Save the current selection in editor so that when focus again, the selection can be restored
     */
    saveSelectionRange(): void;

    /**
     * Restore the saved selection range and clear it
     */
    restoreSavedRange(): void;

    /**
     * Get a rect representing the location of the cursor.
     * @returns a Rect object representing cursor location
     */
    getCursorRect(): Rect;

    /**
     * Add a custom DOM event handler to handle events not handled by roosterjs.
     * Caller need to take the responsibility to dispose the handler properly
     * @param eventName DOM event name to handle
     * @param handler Handler callback
     * @returns A dispose function. Call the function to dispose this event handler
     */
    addDomEventHandler(eventName: string, handler: (event: UIEvent) => void): () => void;

    /**
     * Trigger an event to be dispatched to all plugins
     * @param pluginEvent The event object to trigger
     * @param broadcast indicates if the event needs to be dispatched to all plugins
     * True means to all, false means to allow exclusive handling from one plugin unless no one wants that
     */
    triggerEvent(pluginEvent: PluginEvent, broadcast?: boolean): void;

    /**
     * Trigger a ContentChangedEvent
     * @param source Source of this event, by default is 'SetContent'
     * @param data additional data for this event
     */
    triggerContentChangedEvent(
        source?: ChangeSource | string,
        data?: any
    ): void

    /**
     * Undo last edit operation
     */
    undo(): void;

    /**
     * Redo next edit operation
     */
    redo(): void;

    /**
     * Add undo snapshot, and execute a format callback function, then add another undo snapshot, then trigger
     * ContentChangedEvent with given change source.
     * If this function is called nested, undo snapshot will only be added in the outside one
     * @param callback The callback function to perform formatting, returns a data object which will be used as
     * the data field in ContentChangedEvent if changeSource is not null.
     * @param changeSource The change source to use when fire ContentChangedEvent. When the value is not null,
     * a ContentChangedEvent will be fired with change source equal to this value
     */
    addUndoSnapshot(
        callback?: (start: Position, end: Position) => any,
        changeSource?: ChangeSource | string
    ): void;

    /**
     * Perform an auto complete action in the callback, save a snapsnot of content before the action,
     * and trigger ContentChangedEvent with the change source if specified
     * @param callback The auto complete callback, return value will be used as data field of ContentChangedEvent
     * @param changeSource Chagne source of ContentChangedEvent. If not passed, no ContentChangedEvent will be  triggered
     */
    performAutoComplete(callback: () => any, changeSource?: ChangeSource): void

    /**
     * Whether there is an available undo snapshot
     */
    canUndo(): boolean;

    /**
     * Whether there is an available redo snapshot
     */
    canRedo(): boolean;

    /**
     * Get document which contains this editor
     * @returns The HTML document which contains this editor
     */
    getDocument(): Document;

    /**
     * Get custom data related to this editor
     * @param key Key of the custom data
     * @param getter Getter function. If custom data for the given key doesn't exist,
     * call this function to get one and store it.
     * @param disposer An optional disposer function to dispose this custom data when
     * dispose editor.
     */
    getCustomData<T>(key: string, getter: () => T, disposer?: (value: T) => void): T;

    /**
     * Check if editor is in IME input sequence
     * @returns True if editor is in IME input sequence, otherwise false
     */
    isInIME(): boolean;

    /**
     * Get default format of this editor
     * @returns Default format object of this editor
     */
    getDefaultFormat(): DefaultFormat;

    /**
     * Get a content traverser for the whole editor
     */
    getBodyTraverser(): ContentTraverser;

    /**
     * Get a content traverser for current selection
     */
    getSelectionTraverser(): ContentTraverser;

    /**
     * Get a content traverser for current block element start from specified position
     * @param startFrom Start position of the traverser. Default value is ContentPosition.SelectionStart
     */
    getBlockTraverser(
        startFrom?: ContentPosition
    ): ContentTraverser;

    /**
     * Get a text traverser of current selection
     */
    getContentSearcherOfCursor(): PositionContentSearcher;

    /**
     * Run a callback function asynchronously
     * @param callback The callback function to run
     */
    runAsync(callback: () => void): void;

}

export default IEditor;