import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import EventHandler from './EventHandler';
import { start } from 'node:repl';

const log = require('debug')('replay')
const events: EventHandler[] = [];

interface IHandlerOptions {
  startAtTimestamp?: number;
  offset: number;
  mode: 'auto' | 'manual',
  events?: string[];
}

const defaultOptions: IHandlerOptions = {
  startAtTimestamp: 0,
  offset: 0,
  mode: 'auto',
  events: [],
}

function replayer(emitter: EventEmitter, options: Partial<IHandlerOptions>) {
  options = {
    ...defaultOptions,
    ...options,
  } as IHandlerOptions;

  if (!(emitter instanceof EventEmitter)) {
    throw new Error('emitter is not an instance of EventEmitter')
  }

  let startAtTimestamp = 0
  if (options.startAtTimestamp) {
    startAtTimestamp = options.startAtTimestamp;
  }

  function loggerListener(eventName: string, ...args: [any]) {
    events.push(new EventHandler(performance.now() - startAtTimestamp + options.offset!, eventName, ...args))
  }

  const eventNames = options.mode === 'auto' ? emitter.eventNames() : options.events || [];

  for (const eventName of eventNames) {
    emitter.prependListener(eventName, loggerListener.bind(null, eventName.toString()));
    log(`Registering event ${eventName.toString()}`);
  }
}

export async function replayEnd() {
  await generateFile();
}

async function generateFile(path = 'replay.txt') {

  return fs.writeFile(path, events.map(e => e.toString()).join('\n'));
}

async function fileParser(path = 'replay.txt') {
  const data = await fs.readFile(path, "ascii");

  const parsedData = data.split('\n').filter((row) => row.length > 0).map((row) => row.split('\t'))

  return parsedData.map((s) => new EventHandler(Number(s[0]), s[1], JSON.parse(s[2])));
}

export async function execute(emitter: EventEmitter, path = 'replay.txt') {
  if (!(emitter instanceof EventEmitter)) {
    throw new Error('emitter is not an instance of EventEmitter')
  }

  const data = await fileParser(path);

  function start() {
    return new Promise((resolve) => {
      for (const [index, event] of data.entries()) {
        setTimeout(() => {
          emitter.emit(event.event, event.args);
          if (data.length-1 === index) {
            return resolve(void 0);
          }
        }, event.time)
      }
    });
  }

  return start;
}

export default replayer;
