// offheap-store.js
const N = 1_000_000;

class OffHeapStore {
  constructor(capacity = N) {
    this.capacity = capacity;

    const bytesUserId   = capacity * 4;
    const bytesSocketId = capacity * 4;
    const bytesStatus   = capacity * 1;
    const bytesPad      = capacity * 3;
    const bytesFreeNext = capacity * 4;

    const total =
      bytesUserId +
      bytesSocketId +
      bytesStatus +
      bytesPad +
      bytesFreeNext;

    this.buf = Buffer.allocUnsafe(total);

    let off = 0;
    this.userId   = new Uint32Array(this.buf.buffer, this.buf.byteOffset + off, capacity); off += bytesUserId;
    this.socketId = new Uint32Array(this.buf.buffer, this.buf.byteOffset + off, capacity); off += bytesSocketId;
    this.status   = new Uint8Array (this.buf.buffer, this.buf.byteOffset + off, capacity); off += bytesStatus;
    off += bytesPad;
    this.freeNext = new Int32Array (this.buf.buffer, this.buf.byteOffset + off, capacity);

    for (let i = 0; i < capacity - 1; i++) this.freeNext[i] = i + 1;
    this.freeNext[capacity - 1] = -1;
    this.freeHead = 0;
  }

  allocSlot() {
    const i = this.freeHead;
    if (i === -1) throw new Error("Out of slots");
    this.freeHead = this.freeNext[i];
    this.freeNext[i] = -1;
    return i;
  }

  freeSlot(i) {
    this.userId[i] = 0;
    this.socketId[i] = 0;
    this.status[i] = 0;
    this.freeNext[i] = this.freeHead;
    this.freeHead = i;
  }

  set(i, userId, socketId, status) {
    this.userId[i] = userId >>> 0;
    this.socketId[i] = socketId >>> 0;
    this.status[i] = status & 0xff;
  }
}

module.exports = { OffHeapStore };
