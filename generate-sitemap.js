const fs = require('fs');
const path = require('path');

// Configuración
const baseUrl = 'https://contahabilidad.github.io';
const outputFile = 'sitemap.xml';
const ignoredFolders = ['node_modules', '.git'];

// Función para obtener archivos HTML recursivamente
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && !ignoredFolders.includes(file)) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith('.html') || file === 'index.html') {
      results.push(filePath);
    }
  });
  return results;
}

// Función para obtener la fecha de modificación de cada archivo
function getLastMod(filePath) {
  const stats = fs.statSync(filePath);
  const mtime = stats.mtime;
  return mtime.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Generar URLs
const htmlFiles = getHtmlFiles('.');
let urls = htmlFiles.map(filePath => {
  let url = filePath.replace(/\\/g, '/'); // Windows fix
  url = url.replace(/^\.\/index\.html$/, ''); // raíz
  url = url.replace(/\/index\.html$/, '/'); // index en subcarpetas
  url = url.replace(/^\.\//, ''); // quitar ./ inicial
  return {
    loc: `${baseUrl}/${url}`,
    lastmod: getLastMod(filePath),
    changefreq: 'monthly', // puedes ajustar por tipo de página
    priority: url === '' ? '1.0' : '0.8'
  };
});

// Crear XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(u => {
  xml += `  <url>\n`;
  xml += `    <loc>${u.loc}</loc>\n`;
  xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
  xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
  xml += `    <priority>${u.priority}</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>\n`;

// Guardar archivo
fs.writeFileSync(outputFile, xml);
console.log(`✅ Sitemap generado correctamente en ${outputFile}`);
