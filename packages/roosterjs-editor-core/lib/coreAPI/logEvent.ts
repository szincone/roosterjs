import EditorCore, { LogEvent } from '../editor/EditorCore';

const logEvent: LogEvent = (core: EditorCore, source: string, content: string) => {
    console.log(`[RoosterJS][${source}]${content}`);
};

export default logEvent;