import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const port = process.env.PORT || 8000;
const builtSite = path.join(process.cwd(), 'dist');
const root = process.env.STATIC_ROOT
  ? path.resolve(process.env.STATIC_ROOT)
  : (fs.existsSync(builtSite) ? builtSite : process.cwd());
const mime = {
  '.html':'text/html', '.htm':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.svg':'image/svg+xml', '.json':'application/json', '.txt':'text/plain'
};

function contentTypeFor(ext) {
  const base = mime[ext] || 'application/octet-stream';
  if (base.startsWith('text/') || base === 'application/javascript' || base === 'application/json' || base === 'image/svg+xml') {
    return base + '; charset=utf-8';
  }
  return base;
}

http.createServer((req,res)=>{
  try{
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath.includes('..')) { res.statusCode=400; return res.end('Bad request'); }
    let p = path.join(root, urlPath);
    fs.stat(p, (err, stats)=>{
      if (err){
        // Support extensionless URLs by trying the .html variant.
        if (!path.extname(p)) {
          const htmlPath = p + '.html';
          return fs.stat(htmlPath, (errHtml, statsHtml) => {
            if (errHtml){ res.statusCode = 404; return res.end('Not found'); }
            p = statsHtml.isDirectory() ? path.join(htmlPath, 'index.html') : htmlPath;
            fs.stat(p, (err2, stats2)=>{
              if (err2){ res.statusCode = 404; return res.end('Not found'); }
              const ext = path.extname(p).toLowerCase();
              res.setHeader('Content-Type', contentTypeFor(ext));
              const stream = fs.createReadStream(p);
              stream.on('error', ()=>{ res.statusCode=500; res.end('Server error'); });
              stream.pipe(res);
            });
          });
        }
        res.statusCode = 404; return res.end('Not found');
      }
      if (stats.isDirectory()) p = path.join(p, 'index.html');
      fs.stat(p, (err2, stats2)=>{
        if (err2){ res.statusCode = 404; return res.end('Not found'); }
        const ext = path.extname(p).toLowerCase();
        res.setHeader('Content-Type', contentTypeFor(ext));
        const stream = fs.createReadStream(p);
        stream.on('error', ()=>{ res.statusCode=500; res.end('Server error'); });
        stream.pipe(res);
      });
    });
  }catch(e){ res.statusCode=500; res.end('Server error'); }
}).listen(port, ()=>console.log('Static server listening on http://127.0.0.1:'+port));
