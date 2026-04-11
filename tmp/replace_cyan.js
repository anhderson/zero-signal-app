const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/anhde/OneDrive/Documentos/Projetos/LaboratoriodeDesenvolvimento/ZeroSignal/zerosignal/src';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(directoryPath);

files.forEach(file => {
  if (file.endsWith('.css') || file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('0, 243, 255')) {
      console.log(`Updating ${file}...`);
      const newContent = content.replace(/0, 243, 255/g, 'var(--accent-rgb)');
      fs.writeFileSync(file, newContent, 'utf8');
    }
  }
});

console.log('Design unification complete across all files.');
