import { Queue } from './queue';


describe('Queue', () => {

  it('#constructor creates new queue with no items', () => {
    const queue = new Queue(10);

    expect(queue.size).toBe(0);
    for (const item of queue) {
      throw new Error('Queue iterator expected to yield no items but gave: ' + item);
    }
  });

  it('#size returns current number of items', () => {
    const queue = new Queue(10);
    queue.add(5);
    queue.add(-100);
    queue.add(44);

    expect(queue.size).toBe(3);
  });

  it('returns current items in form of an iterator', () => {
    const queue = new Queue(10);
    queue.add(5);
    queue.add(-100);
    queue.add(44);

    const items = [];
    for (const item of queue) {
      items.push(item);
    }

    expect(items).toEqual([44, -100, 5]);
  });

  it('trims items to not exceed given capacity', () => {
    const queue = new Queue(4);
    queue.add(5);
    queue.add(-100);
    queue.add(44);
    queue.add(123456);
    queue.add(-6);
    queue.add(0.0001);

    expect(queue.size).toBe(4);

    const items = [];
    for (const item of queue) {
      items.push(item);
    }
    expect(items).toEqual([0.0001, -6, 123456, 44]);
  });
});
