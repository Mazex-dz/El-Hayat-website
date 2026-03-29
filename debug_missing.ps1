$prices_html = Get-Content -Path "c:\Users\M4C\Documents\laboxo - Copy\laboxo\prices.html" -Raw
$target_dir = "c:\Users\M4C\Documents\laboxo - Copy\laboxo\nunupdf"

if ($prices_html -match 'const pdfMapping = \{([\s\S]+?)\};') {
    $mapping_content = $matches[1]
    $pattern = '"(.+?)":\s*"(.+?\.pdf)"'
    $matches_all = [regex]::Matches($mapping_content, $pattern)
    
    foreach ($m in $matches_all) {
        $key = $m.Groups[1].Value
        $filename = $m.Groups[2].Value
        $file_path = Join-Path $target_dir $filename
        
        if (-not (Test-Path $file_path)) {
            Write-Output "MISSING: '$key' -> $filename"
        }
    }
}
