// tsunami.js
const WebSocket = require("ws");
const { OffHeapStore } = require("./offheap-store");

const MAX_CONN = 1_000_000;
const REPORT_INTERVAL = 5000;

const store = new OffHeapStore(MAX_CONN);

const wss = new WebSocket.Server({
  port: 8080,
  perMessageDeflate: false
});

let nextSocketId = 1;
let activeConnections = 0;

// --------------------
// WS CONNECTIONS
// --------------------
wss.on("connection", (ws) => {
  const slot = store.allocSlot();
  ws._slot = slot;

  const userId = (Math.random() * 0xffffffff) >>> 0;
  const socketId = nextSocketId++;

  store.set(slot, userId, socketId, 1);
  activeConnections++;

  ws.on("close", () => {
    store.freeSlot(ws._slot);
    activeConnections--;
  });

  ws.on("message", () => {
    store.status[ws._slot] = 2; // idle
  });
});

console.log("🚀 Tsunami WS server listening on :8080");

// --------------------
// REPORTING
// --------------------
let lastTick = process.hrtime.bigint();

setInterval(() => {
  const now = process.hrtime.bigint();
  const loopDelayMs = Number(now - lastTick) / 1e6;
  lastTick = now;

  const mem = process.memoryUsage();

  const usedSlots = activeConnections;
  const freeSlots = MAX_CONN - usedSlots;

  console.clear();
  console.log("🌊 TSUNAMI REPORT");
  console.log("------------------------------");
  console.log(`Active Connections : ${usedSlots}`);
  console.log(`Free Slots         : ${freeSlots}`);
  console.log("------------------------------");
  console.log(`RSS        : ${(mem.rss / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Heap Used  : ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Heap Total : ${(mem.heapTotal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`External   : ${(mem.external / 1024 / 1024).toFixed(1)} MB`);
  console.log("------------------------------");
  console.log(`Event Loop Delay ~ ${loopDelayMs.toFixed(2)} ms`);
}, REPORT_INTERVAL);
