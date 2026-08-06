const http = require('http');
http.get('http://127.0.0.1:8000/alfaquest.html', res=>{
  console.log('STATUS', res.statusCode);
  let b=''; res.on('data', d=>b+=d.toString()); res.on('end', ()=>console.log('LEN', b.length));
}).on('error', e=>{ console.error('ERR', e.message); process.exit(2); });
