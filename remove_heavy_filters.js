import fs from "fs";
import path from "path";

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walkDir("/Users/paul/Desktop/SMBx-active/client/src/components/v6");

let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace heavy inline filters
  // e.g. backdropFilter: "blur(8px) saturate(170%) contrast(1.04)"
  // -> backdropFilter: "blur(8px)"
  const original = content;
  content = content.replace(/(backdropFilter:\s*["']blur\(\d+px\))([^"']*)(["'])/g, "$1$3");
  content = content.replace(/(WebkitBackdropFilter:\s*["']blur\(\d+px\))([^"']*)(["'])/g, "$1$3");
  
  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    modifiedFiles++;
    console.log(`Modified ${file}`);
  }
});

console.log(`Done! Modified ${modifiedFiles} files.`);
