const fs = require('fs');
const path = require('path');

// Configuración
const baseUrl = 'https://contahabilidad.github.io';
const outputFile = 'sitemap.xml';
const ignoredFolders = ['node_modules', '.git', '.github'];

// Tipos de páginas para asignar changefreq y priority
const pageSettings = {
  'index.html': { changefreq: 'weekly', priority: '1.0' },
  'articulos/': { changefreq: 'monthly', priority: '0.8' },
  'legal/': { changefreq: 'yearly', priority: '0.3' }, // opcional si agrupas legales en carpeta
  'default': { changefreq: 'monthly', priority: '0.5' }
};

// Lista de páginas legales (no necesitas moverlas a carpeta)
const legalPages = [
  'aviso-legal.html',
  'cookies.html',
  'politica-privacidad.html',
  'terminos-condiciones.html'
];

// Función para obtener archivos HTML recursivamente
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !ignoredFolders.includes(file)) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith('.html') || file === 'index.html') {
      results.push(filePath);
    }
  });
  return results;
}

// Función para obtener fecha de modificación
function getLastMod(filePath) {
  const stats = fs.statSync(filePath);
  const mtime = stats.mtime;
  return mtime.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Función para asignar settings según tipo de página
function getPageSettings(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  if (normalizedPath.endsWith('index.html') && normalizedPath === './index.html') {
    return pageSettings['index.html'];
  }
  
  for (let page of legalPages) {
    if (normalizedPath.endsWith(page)) {
      return pageSettings['legal/'];
    }
  }

  if (normalizedPath.startsWith('./articulos/')) {
    return pageSettings['articulos/'];
  }

  return pageSettings['default'];
}

// Generar URLs
const htmlFiles = getHtmlFiles('.');
let urls = htmlFiles.map(filePath => {
  let url = filePath.replace(/\\/g, '/'); // Windows fix
  url = url.replace(/^\.\/index\.html$/, ''); // raíz
  url = url.replace(/\/index\.html$/, '/'); // index en subcarpetas
  url = url.replace(/^\.\//, ''); // quitar ./ inicial

  const settings = getPageSettings(filePath);

  return {
    loc: `${baseUrl}/${url}`,
    lastmod: getLastMod(filePath),
    changefreq: settings.changefreq,
    priority: settings.priority
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
console.log(`✅ Sitemap avanzado generado correctamente en ${outputFile}`);
