function Verify-FileLinks($filePath) {
    Write-Host "`nVerifying links in: $filePath" -ForegroundColor Cyan
    $content = Get-Content -Path $filePath -Raw
    $target_dir = "c:\Users\M4C\Documents\laboxo - Copy\laboxo\nunupdf"

    if ($content -match 'const pdfMapping = \{([\s\S]+?)\};') {
        $mapping_content = $matches[1]
        $mappings = [regex]::Matches($mapping_content, '"(.+?)":\s*"(.+?)"')
        
        $total = $mappings.Count
        $failed = 0
        
        foreach ($m in $mappings) {
            $key = $m.Groups[1].Value
            $file = $m.Groups[2].Value
            $fullPath = Join-Path $target_dir $file
            
            if (-not (Test-Path $fullPath)) {
                Write-Host "FAILED: Key '$key' -> File '$file' NOT FOUND" -ForegroundColor Red
                $failed++
            }
        }
        
        Write-Host "Summary for $(Split-Path $filePath -Leaf): $total mappings checked, $failed failed."
    } else {
        Write-Host "ERROR: pdfMapping not found in $filePath" -ForegroundColor Red
    }
}

Verify-FileLinks "c:\Users\M4C\Documents\laboxo - Copy\laboxo\prices.html"
Verify-FileLinks "c:\Users\M4C\Documents\laboxo - Copy\laboxo\prices2.htm"
