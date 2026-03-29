// Script to parse a.txt file and extract analyses
const fs = require('fs');

// Read the a.txt file
const aTxtContent = fs.readFileSync('c:/Users/M4C/Desktop/a.txt', 'utf8');

// Parse the a.txt file
const lines = aTxtContent.split('\n').filter(line => line.trim());
const header = lines[0].split('\t');
const analyses = [];

console.log('Header:', header);

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = line.split('\t');
  
  if (parts.length >= 6) {
    const nom = parts[0].trim();
    const abr = parts[1].trim();
    
    // Parse price - handle different formats
    let prixText = parts[2].trim();
    let prix = 0;
    
    // Remove "DZD" and any commas, then parse as float
    prixText = prixText.replace('DZD', '').replace(/,/g, '').trim();
    
    // Handle cases where price might be empty or malformed
    if (prixText && !isNaN(parseFloat(prixText))) {
      prix = parseFloat(prixText);
    } else {
      console.log(`Warning: Could not parse price for "${nom}": "${parts[2]}"`);
      continue;
    }
    
    const categorie = parts[3].trim();
    const source = parts[4].trim();
    const unite = parts[5].trim();
    
    analyses.push({
      nom,
      abr,
      prix,
      categorie,
      source,
      unite
    });
  } else {
    console.log(`Skipping line ${i + 1}: "${line}" - not enough parts`);
  }
}

console.log(`\nParsed ${analyses.length} analyses:`);
analyses.forEach((analysis, index) => {
  console.log(`${index + 1}. ${analysis.nom} (${analysis.abr}) - ${analysis.prix} DZD`);
});

// Generate JSON array for prices.html
const jsonArray = analyses.map(analysis => 
  `{"nom":"${analysis.nom}","abr":"${analysis.abr}","prix":${analysis.prix},"categorie":"${analysis.categorie}","source":"${analysis.source}","unite":"${analysis.unite}"}`
).join(',\n');

console.log('\nJSON array for prices.html:');
console.log('const analyses = [');
console.log(jsonArray);
console.log('];');
