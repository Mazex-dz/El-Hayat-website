$prices_html = Get-Content -Path "c:\Users\M4C\Documents\laboxo - Copy\laboxo\prices.html" -Raw
$target_dir = "c:\Users\M4C\Documents\laboxo - Copy\laboxo\nunupdf"

# Extract pdfMapping object content
if ($prices_html -match 'const pdfMapping = \{([\s\S]+?)\};') {
    $mapping_content = $matches[1]
    # Find all "Key": "Value.pdf" patterns
    $pattern = '"(.+?)":\s*"(.+?\.pdf)"'
    $matches_all = [regex]::Matches($mapping_content, $pattern)
    
    $missing_files = @()
    $found_count = 0
    
    foreach ($m in $matches_all) {
        $key = $m.Groups[1].Value
        $filename = $m.Groups[2].Value
        $file_path = Join-Path $target_dir $filename
        
        if (Test-Path $file_path) {
            $found_count++
        } else {
            $missing_files += "$key -> $filename"
        }
    }
    
    Write-Host "Verification Summary:"
    Write-Host "Total mappings found: $($matches_all.Count)"
    Write-Host "Files successfully found: $found_count"
    
    if ($missing_files.Count -gt 0) {
        Write-Host "`nMissing Files:" -ForegroundColor Red
        foreach ($missing in $missing_files) {
            Write-Host "  $missing" -ForegroundColor Red
        }
    } else {
        Write-Host "`nAll mapped files exist!" -ForegroundColor Green
    }
} else {
    Write-Host "Could not find pdfMapping object in prices.html" -ForegroundColor Red
}
