// เซิร์ฟเวอร์ https สำหรับทดสอบบนมือถือในวง Wi-Fi เดียวกัน: node serve.js
const https = require('https'), fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const PORT = 8443, dir = __dirname;
const ips = Object.values(os.networkInterfaces()).flat()
  .filter(i => i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.')).map(i => i.address);
const keyF = path.join(dir, '.cert-key.pem'), crtF = path.join(dir, '.cert.pem');

if (!fs.existsSync(keyF) || !fs.existsSync(crtF)) {
  const san = ['DNS:localhost', 'IP:127.0.0.1', ...ips.map(i => 'IP:' + i)].join(',');
  const openssl = [process.env.OPENSSL, 'C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe', 'openssl'].find(p => p && (p === 'openssl' || fs.existsSync(p)));
  execFileSync(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '365', '-keyout', keyF, '-out', crtF,
    '-subj', '/CN=omr-local', '-addext', 'subjectAltName=' + san], { stdio: 'ignore' });
  console.log('สร้างใบรับรองแล้ว');
}

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
https.createServer({ key: fs.readFileSync(keyF), cert: fs.readFileSync(crtF) }, (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(dir, path.normalize(p));
  if (!f.startsWith(dir) || path.basename(f).startsWith('.') || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log('\nเปิดบนมือถือ (ต้องต่อ Wi-Fi เดียวกับคอม):');
  ips.forEach(i => console.log('  https://' + i + ':' + PORT));
  console.log('\nมือถือจะเตือน "ไม่ปลอดภัย" ให้กด ขั้นสูง > ดำเนินการต่อ แล้วอนุญาตกล้อง\nกด Ctrl+C เพื่อหยุด');
});
