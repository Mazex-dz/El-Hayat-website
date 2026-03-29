// Script to compare analyses from a.txt with prices.html
const fs = require('fs');
const path = require('path');

// Read the a.txt file
const aTxtContent = fs.readFileSync('c:/Users/M4C/Desktop/a.txt', 'utf8');

// Parse the a.txt file
const lines = aTxtContent.split('\n').filter(line => line.trim());
const header = lines[0].split('\t');
const aTxtAnalyses = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = line.split('\t');
  
  if (parts.length >= 6) {
    const nom = parts[0].trim();
    const abr = parts[1].trim();
    const prix = parseFloat(parts[2].replace('DZD', '').replace(',', '').trim());
    const categorie = parts[3].trim();
    const source = parts[4].trim();
    const unite = parts[5].trim();
    
    aTxtAnalyses.push({
      nom,
      abr,
      prix,
      categorie,
      source,
      unite
    });
  }
}

console.log(`Found ${aTxtAnalyses.length} analyses in a.txt file`);

// Read the prices.html file
const pricesHtmlContent = fs.readFileSync('prices.html', 'utf8');

// Extract the analyses array from prices.html
const analysesMatch = pricesHtmlContent.match(/const analyses = \[([\s\S]*?)\];/);
if (!analysesMatch) {
  console.log('Could not find analyses array in prices.html');
  process.exit(1);
}

const analysesArrayContent = analysesMatch[1];
// Parse the JSON array (this is a simplified approach)
const htmlAnalyses = [];
const analysisRegex = /\{"nom":"([^"]+)","abr":"([^"]+)","prix":([\d.]+),"categorie":"([^"]+)","source":"([^"]*)","unite":"([^"]*)"\}/g;
let match;

while ((match = analysisRegex.exec(analysesArrayContent)) !== null) {
  htmlAnalyses.push({
    nom: match[1],
    abr: match[2],
    prix: parseFloat(match[3]),
    categorie: match[4],
    source: match[5],
    unite: match[6]
  });
}

console.log(`Found ${htmlAnalyses.length} analyses in prices.html`);

// Find analyses that are in a.txt but not in prices.html
const missingAnalyses = aTxtAnalyses.filter(aTxtItem => 
  !htmlAnalyses.some(htmlItem => 
    htmlItem.nom === aTxtItem.nom && 
    htmlItem.abr === aTxtItem.abr
  )
);

console.log(`\nMissing analyses (${missingAnalyses.length}):`);
missingAnalyses.forEach((analysis, index) => {
  console.log(`${index + 1}. ${analysis.nom} (${analysis.abr}) - ${analysis.prix} DZD - ${analysis.categorie}`);
});

// Find analyses that have different prices
const differentPriceAnalyses = aTxtAnalyses.filter(aTxtItem => {
  const htmlItem = htmlAnalyses.find(htmlItem => 
    htmlItem.nom === aTxtItem.nom && 
    htmlItem.abr === aTxtItem.abr
  );
  return htmlItem && htmlItem.prix !== aTxtItem.prix;
});

console.log(`\nAnalyses with different prices (${differentPriceAnalyses.length}):`);
differentPriceAnalyses.forEach((analysis, index) => {
  const htmlItem = htmlAnalyses.find(htmlItem => 
    htmlItem.nom === analysis.nom && 
    htmlItem.abr === analysis.abr
  );
  console.log(`${index + 1}. ${analysis.nom} (${analysis.abr}): a.txt=${analysis.prix} vs prices.html=${htmlItem.prix}`);
});

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Total analyses in a.txt: ${aTxtAnalyses.length}`);
console.log(`Total analyses in prices.html: ${htmlAnalyses.length}`);
console.log(`Missing analyses: ${missingAnalyses.length}`);
console.log(`Analyses with different prices: ${differentPriceAnalyses.length}`);
