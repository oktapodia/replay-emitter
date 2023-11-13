import { EventEmitter } from 'events';
import debug from 'debug';
import { promises as fs } from 'fs';
import setSystemTime = jest.setSystemTime;

const log = require('debug')('replay')
const events: EventHandler[] = [];

interface IHandlerOptions {
  offset: number;
}

function handler(emitter: EventEmitter, options: IHandlerOptions = {
  offset: 0,
}) {
  if (!(emitter instanceof EventEmitter)) {
    throw new Error('emitter is not an instance of EventEmitter')
  }

  function loggerListener(eventName: string, ...args: [any]) {
    events.push(new EventHandler(performance.now() + options.offset, eventName, ...args))
  }

  for(const eventName of emitter.eventNames()) {
    for (const listener of emitter.listeners(eventName)) {
      emitter.prependListener(eventName, loggerListener.bind(null, eventName.toString()));

      log(`Registering event ${eventName.toString()}`);
    }
  }
}

class EventHandler {
  constructor(public time: number, public event: string, public args: any[]) {
  }

  toString() {
    return `${this.time.toFixed(0)}\t${this.event}\t${JSON.stringify(this.args)}`
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

export default handler;
