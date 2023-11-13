# Replay-emitter

Replay-emitter is a simple tool to record/replay events from a file to nodejs EventEmitter.

## Installation


```bash
npm install replay-emitter
```

```bash
yarn add replay-emitter
```

## Usage

### Record events

```javascript
import handler, { replayEnd } from 'replay-emitter';
import { EventEmitter } from 'events';
// After registering all the `.on` and `.once` listeners

const emitter = new EventEmitter();
handler(emitter)

// When you did finish recording enough sample

setTimeout(async () => {
  await replayEnd()
  console.log('REPLAY END')
  
  // This function is gonna save the events to the replay.txt file at the root of the project
}, 10000)
```

### Replay events

```javascript
import handler, { replayEnd } from 'replay-emitter';
import { EventEmitter } from 'events';
// After registering all the `.on` and `.once` listeners

const emitter = new EventEmitter();

const startFunction = await execute(emitter, 'pathtothefile/replay.txt');

// start the replay
await startFunction();
```
