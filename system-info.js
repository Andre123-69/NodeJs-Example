import os from 'node:os';

console.log('Tipo de SO:', os.type());
console.log('Version de SO: ', os.release());
console.log('Arquitectura:', os.arch());
console.log('Memoria actual: ', os.freemem());
console.log('Memoria total: ', os.totalmem());
console.log('Uptime: ', os.uptime());
console.log('Hostname: ', os.hostname());
