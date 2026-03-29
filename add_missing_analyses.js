// Script to add missing analyses from a.txt to prices.html
const fs = require('fs');

// Read the a.txt file and parse it
const aTxtContent = fs.readFileSync('c:/Users/M4C/Desktop/a.txt', 'utf8');
const lines = aTxtContent.split('\n').filter(line => line.trim());
const aTxtAnalyses = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = line.split('\t');
  
  if (parts.length >= 6) {
    const nom = parts[0].trim();
    const abr = parts[1].trim();
    let prixText = parts[2].trim();
    let prix = 0;
    
    prixText = prixText.replace('DZD', '').replace(/,/g, '').trim();
    if (prixText && !isNaN(parseFloat(prixText))) {
      prix = parseFloat(prixText);
    } else {
      continue; // Skip items with invalid prices
    }
    
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

// Read the prices.html file
const pricesHtmlContent = fs.readFileSync('prices.html', 'utf8');

// Extract the analyses array from prices.html
const analysesMatch = pricesHtmlContent.match(/const analyses = \[([\s\S]*?)\];/);
if (!analysesMatch) {
  console.log('Could not find analyses array in prices.html');
  process.exit(1);
}

const analysesArrayContent = analysesMatch[1];
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

// Find analyses that are in a.txt but not in prices.html
const missingAnalyses = aTxtAnalyses.filter(aTxtItem => 
  !htmlAnalyses.some(htmlItem => 
    htmlItem.nom === aTxtItem.nom && 
    htmlItem.abr === aTxtItem.abr
  )
);

console.log(`Found ${missingAnalyses.length} missing analyses to add`);

if (missingAnalyses.length === 0) {
  console.log('No missing analyses found');
  process.exit(0);
}

// Create the new analyses array by combining existing and missing analyses
const allAnalyses = [...htmlAnalyses, ...missingAnalyses];

// Generate the new JSON array
const newAnalysesArray = allAnalyses.map(analysis => 
  `{"nom":"${analysis.nom}","abr":"${analysis.abr}","prix":${analysis.prix},"categorie":"${analysis.categorie}","source":"${analysis.source}","unite":"${analysis.unite}"}`
).join(',\n');

// Replace the analyses array in the HTML content
const newHtmlContent = pricesHtmlContent.replace(
  /const analyses = \[[\s\S]*?\];/,
  `const analyses = [\n${newAnalysesArray}\n];`
);

// Write the updated content back to prices.html
fs.writeFileSync('prices.html', newHtmlContent);

console.log(`Successfully added ${missingAnalyses.length} missing analyses to prices.html`);
console.log('Updated prices.html file saved');
