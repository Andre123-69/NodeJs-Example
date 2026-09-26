import os from 'node:os';
import ms from 'ms';

console.log('Tipo de SO:', os.type());
console.log('Version de SO: ', os.release());
console.log('Arquitectura:', os.arch());
console.log('Memoria actual: ', os.freemem());
console.log('Memoria total: ', os.totalmem());
console.log('Uptime: ', os.uptime());
console.log('Hostname: ', os.hostname());
console.log('Directorio home del usuario:', os.homedir());

console.log('Tiempo de actividad:', ms(os.uptime() * 1000, { long: true }));

