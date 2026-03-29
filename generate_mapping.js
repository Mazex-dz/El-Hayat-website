
const fs = require('fs');
const path = require('path');

// 1. Get Analysis Names from prices.html
const pricesHtmlPath = path.join('c:/Users/M4C/Documents/laboxo', 'prices.html');
const pricesHtmlContent = fs.readFileSync(pricesHtmlPath, 'utf8');

// Extract the analyses array using regex
const analysesMatch = pricesHtmlContent.match(/const analyses = \[\s*([\s\S]*?)\];/);
if (!analysesMatch) {
    console.error("Could not find analyses array in prices.html");
    process.exit(1);
}

// Parse the JSON-like content (it's JS object literals, but looks like JSON in the file)
// We need to be careful if it's not strict JSON. The file shows keys are quoted, so JSON.parse might work if we wrap it in [].
// Let's try to eval it or just parse it loosely.
let analysesData;
try {
    // It's already inside [], so we just need to parse the inner part. 
    // But wait, the file content is `const analyses = [ ... ];`.
    // Let's construct a valid JSON string.
    const jsonString = '[' + analysesMatch[1] + ']';
    // The file content has keys quoted "nom": ..., so it should be valid JSON.
    analysesData = JSON.parse(jsonString);
} catch (e) {
    console.error("Error parsing analyses JSON:", e);
    // Fallback: try to evaluate it as JS (less safe but we are in a controlled env)
    // actually, let's just use regex to extract "nom" values if JSON parse fails
    const nomMatches = analysesMatch[1].match(/"nom"\s*:\s*"([^"]+)"/g);
    analysesData = nomMatches.map(m => ({ nom: m.match(/"nom"\s*:\s*"([^"]+)"/)[1] }));
}

// 2. Get PDF Filenames
const pdfDir = path.join('c:/Users/M4C/Documents/laboxo', 'nunupdf');
let pdfFiles = [];
try {
    pdfFiles = fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith('.pdf'));
} catch (e) {
    console.error("Error reading nunupdf directory:", e);
    process.exit(1);
}

// 3. Match
const mapping = {};
const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

analysesData.forEach(analysis => {
    const analysisName = analysis.nom;
    const normalizedAnalysisName = normalize(analysisName);

    // Try to find a matching PDF
    const matchingPdf = pdfFiles.find(pdf => {
        const pdfNameWithoutExt = path.parse(pdf).name;
        const normalizedPdfName = normalize(pdfNameWithoutExt);
        return normalizedPdfName === normalizedAnalysisName;
    });

    if (matchingPdf) {
        mapping[analysisName] = `nunupdf/${matchingPdf}`;
    }
});

// 4. Output the mapping
console.log(JSON.stringify(mapping, null, 2));
