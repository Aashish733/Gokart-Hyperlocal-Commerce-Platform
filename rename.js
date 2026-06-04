const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          if (file.includes('node_modules') || file.includes('.git') || file.includes('dist')) {
            next();
          } else {
            walk(file, (err, res) => {
              results = results.concat(res);
              next();
            });
          }
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

walk(__dirname, (err, results) => {
  if (err) throw err;
  results.forEach((file) => {
    if (!file.match(/\.(ts|tsx|js|jsx|json|yml|yaml|md|css)$/)) return;
    if (file.includes('rename.js')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    content = content.replace(/restaraunt/g, 'store');
    content = content.replace(/Restaraunt/g, 'Store');
    
    if (content !== original) {
      console.log('Updated typo:', file);
      fs.writeFileSync(file, content, 'utf8');
    }
  });
});
