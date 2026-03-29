$prices_html = Get-Content -Path "c:\Users\M4C\Documents\laboxo - Copy\laboxo\prices.html" -Raw
$target_dir = "c:\Users\M4C\Documents\laboxo - Copy\laboxo\nunupdf"

# Extract analyses array
if ($prices_html -match 'const analyses = (\[[\s\S]+?\]);') {
    $analyses_json = $matches[1] -replace '(?m)^\s*//.*$', '' # Basic comment removal
    # We can't easily parse this complex JS array with PowerShell's ConvertFrom-Json if it has trailing commas or non-quoted keys.
    # Let's use regex to get all "nom" values.
    $nom_pattern = '"nom":\s*"(.+?)"'
    $all_noms = [regex]::Matches($analyses_json, $nom_pattern) | ForEach-Object { $_.Groups[1].Value }
}

# Extract pdfMapping
if ($prices_html -match 'const pdfMapping = \{([\s\S]+?)\};') {
    $mapping_content = $matches[1]
    $mapped_noms = [regex]::Matches($mapping_content, '"(.+?)":') | ForEach-Object { $_.Groups[1].Value }
}

$pdf_files = Get-ChildItem -Path $target_dir -Filter "*.pdf" | Select-Object -ExpandProperty Name

Write-Host "--- Audit Results ---"
Write-Host "Total Analyses: $($all_noms.Count)"
Write-Host "Total Mapped: $($mapped_noms.Count)"
Write-Host "Total PDF Files: $($pdf_files.Count)"

Write-Host "`nChecking for PDFs that exist but are NOT in pdfMapping:" -ForegroundColor Cyan
foreach ($file in $pdf_files) {
    if ($file -eq "Locus B (Guide_immunogÃ©nÃ©tique_2018.)pdf.pdf") { continue } # Skip weird name
    
    $clean_file = ($file -replace "\.pdf$", "").Trim()
    if ($mapped_noms -notcontains $clean_file -and $mapped_noms -notcontains $file) {
        # Check if it matches any analysis name roughly
        $match = $all_noms | Where-Object { $_ -like "*$clean_file*" -or $clean_file -like "*$_*" }
        if ($match) {
            Write-Host "POTENTIAL MISSING LINK: File '$file' matches analysis '$($match -join ', ')仪表" -ForegroundColor Yellow
        } else {
             Write-Host "UNMAPPED FILE: '$file' (No clear analysis match)" -ForegroundColor Gray
        }
    }
}

Write-Host "`nChecking for Analyses that match PDF filenames but have no 'Guide' button:" -ForegroundColor Cyan
foreach ($nom in $all_noms) {
    if ($mapped_noms -notcontains $nom) {
        $matching_file = $pdf_files | Where-Object { $_ -match [regex]::Escape($nom) }
        if ($matching_file) {
             Write-Host "MISSING MAPPING: Analysis '$nom' has matching file '$matching_file'" -ForegroundColor Red
        }
    }
}
