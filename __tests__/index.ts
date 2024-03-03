import { EventEmitter } from 'events';
import handler, { replayEnd, execute } from '../src';
import { promises as fs } from 'fs';

describe('Test suite', () => {
  test('Test handle events mode auto', async () => {
    const door = new EventEmitter();

    const stubDoorbell = jest.fn()
    door.on("doorbell", stubDoorbell);

    const stubDoorbellstate = jest.fn()
    door.on("doorbellstate", stubDoorbellstate);

    const stubDoorbellhistorystate = jest.fn()
    door.on("doorbellhistorystate", stubDoorbellhistorystate);

    handler(door, { offset: -1000 })

    const spyEmitter = jest.spyOn(door, 'emit')

    door.emit("doorbellstate", 'waiting for a ring...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    door.emit("doorbell", 3);
    door.emit("doorbellhistorystate", ['waiting for a ring...', 'rang for 3 seconds.']);
    door.emit("doorbellstate", 'rang for 3 seconds.');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    door.emit("doorbell", 2);
    door.emit("doorbellhistorystate", ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.']);
    door.emit("doorbellstate", 'rang for 2 seconds.');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    door.emit("doorbellstate", 'opening door');
    door.emit("doorbellhistorystate", ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.', 'opening door']);

    expect(spyEmitter).toHaveBeenCalledTimes(9)
    expect(stubDoorbell).toHaveBeenNthCalledWith(1, 3)
    expect(stubDoorbell).toHaveBeenNthCalledWith(2, 2)
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(1, 'waiting for a ring...')
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(2, 'rang for 3 seconds.')
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(3, 'rang for 2 seconds.')
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(1, ['waiting for a ring...', 'rang for 3 seconds.'])
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(2, ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.'])
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(3, ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.', 'opening door'])

    await replayEnd();

    // @TODO test file contents
    expect((await fs.stat('replay.txt')).isFile()).toEqual(true);
  })

  test('Test handle events mode manual', async () => {
    const door = new EventEmitter();

    const stubDoorbell = jest.fn()
    door.on("doorbell", stubDoorbell);
    const stubNotHandledEvent = jest.fn()
    door.on("nothandledevent", stubNotHandledEvent);

    const stubDoorbellstate = jest.fn()
    door.on("doorbellstate", stubDoorbellstate);

    const stubDoorbellhistorystate = jest.fn()
    door.on("doorbellhistorystate", stubDoorbellhistorystate);

    handler(door, { offset: -1000, mode: 'manual', events: ['doorbell', 'doorbellstate', 'doorbellhistorystate'] })

    const spyEmitter = jest.spyOn(door, 'emit')

    door.emit("doorbellstate", 'waiting for a ring...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    door.emit("nothandledevent", 42);
    door.emit("doorbell", 3);
    door.emit("doorbellhistorystate", ['waiting for a ring...', 'rang for 3 seconds.']);
    door.emit("doorbellstate", 'rang for 3 seconds.');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    door.emit("doorbell", 2);
    door.emit("doorbellhistorystate", ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.']);
    door.emit("doorbellstate", 'rang for 2 seconds.');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    door.emit("doorbellstate", 'opening door');
    door.emit("doorbellhistorystate", ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.', 'opening door']);

    expect(spyEmitter).toHaveBeenCalledTimes(10)
    expect(stubDoorbell).toHaveBeenNthCalledWith(1, 3)
    expect(stubDoorbell).toHaveBeenNthCalledWith(2, 2)
    expect(stubNotHandledEvent).toHaveBeenCalledWith(42)
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(1, 'waiting for a ring...')
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(2, 'rang for 3 seconds.')
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(3, 'rang for 2 seconds.')
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(1, ['waiting for a ring...', 'rang for 3 seconds.'])
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(2, ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.'])
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(3, ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.', 'opening door'])

    await replayEnd();

    // @TODO test file contents
    expect((await fs.stat('replay.txt')).isFile()).toEqual(true);
  })

  test('Test replay events', async () => {
    const door = new EventEmitter();

    const stubDoorbell = jest.fn()
    door.on("doorbell", stubDoorbell);

    const stubDoorbellstate = jest.fn()
    door.on("doorbellstate", stubDoorbellstate);

    const stubDoorbellhistorystate = jest.fn()
    door.on("doorbellhistorystate", stubDoorbellhistorystate);

    const startFunction = await execute(door, '__tests__/replay.txt');

    await startFunction();

    expect(stubDoorbell).toHaveBeenNthCalledWith(1, 3)
    expect(stubDoorbell).toHaveBeenNthCalledWith(2, 2)
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(1, 'waiting for a ring...')
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(2, 'rang for 3 seconds.')
    expect(stubDoorbellstate).toHaveBeenNthCalledWith(3, 'rang for 2 seconds.')
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(1, ['waiting for a ring...', 'rang for 3 seconds.'])
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(2, ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.'])
    expect(stubDoorbellhistorystate).toHaveBeenNthCalledWith(3, ['waiting for a ring...', 'rang for 3 seconds.', 'rang for 2 seconds.', 'opening door'])
  })

  test('Test can handle BigInt events', async () => {
    const door = new EventEmitter();

    const stubBitIntEvent = jest.fn()
    door.on("doorbell", stubBitIntEvent);

    handler(door, { offset: -1000, mode: 'manual', events: ['doorbell'] })

    const spyEmitter = jest.spyOn(door, 'emit')

    door.emit("doorbell", { s: BigInt(42) });

    expect(spyEmitter).toHaveBeenCalledTimes(1)
    expect(stubBitIntEvent).toHaveBeenNthCalledWith(1, { s: BigInt(42) })

    await replayEnd();

    // @TODO test file contents
    expect((await fs.stat('replay.txt')).isFile()).toEqual(true);
  })

  describe('Test startAtTimestamp option', () => {
    // @TODO: Fix this test
    test.skip('Test without startAtTimestamp option', async () => {
      const door = new EventEmitter();

      const offsetTime = 5000;

      await new Promise((resolve) => setTimeout(resolve, offsetTime));

      const stubBitIntEvent = jest.fn()
      door.on("doorbell", stubBitIntEvent);

      handler(door, { mode: 'manual', events: ['doorbell'] })

      const spyEmitter = jest.spyOn(door, 'emit')

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 400));

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 300));

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 200));

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(spyEmitter).toHaveBeenCalledTimes(4)
      expect(stubBitIntEvent).toHaveBeenNthCalledWith(4, { s: BigInt(42) })

      await replayEnd();

      expect((await fs.stat('replay.txt')).isFile()).toEqual(true);

      const data = await fs.readFile('replay.txt', "utf-8");
      expect(parseInt(data.split(" ")[0].split("\t")[0], 10)).toBeGreaterThan(offsetTime);
    }, 15000)

    test('Test with startAtTimestamp option', async () => {
      const door = new EventEmitter();

      const offsetTime = 5000;

      await new Promise((resolve) => setTimeout(resolve, offsetTime));

      const stubBitIntEvent = jest.fn()
      door.on("doorbell", stubBitIntEvent);

      handler(door, { startAtTimestamp: performance.now(), mode: 'manual', events: ['doorbell'] })

      const spyEmitter = jest.spyOn(door, 'emit')

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 400));

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 300));

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 200));

      door.emit("doorbell", { s: BigInt(42) });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(spyEmitter).toHaveBeenCalledTimes(4)
      expect(stubBitIntEvent).toHaveBeenNthCalledWith(4, { s: BigInt(42) })

      await replayEnd();

      expect((await fs.stat('replay.txt')).isFile()).toEqual(true);

      const data = await fs.readFile('replay.txt', "utf-8");
      expect(parseInt(data.split(" ")[0].split("\t")[0], 10)).toBeLessThan(offsetTime);
    }, 15000)
  });
})
