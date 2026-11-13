# Baixa a midia do Higgsfield para assets/media e converte as imagens em JPG leve.
# Rode pelo arquivo baixar-midia.bat (duplo clique) na pasta do site.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root 'assets\media'
$tmp  = Join-Path $env:TEMP 'athomon-midia'
New-Item -ItemType Directory -Force -Path $out, $tmp | Out-Null
Add-Type -AssemblyName System.Drawing

$cdn = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Ltc2vMDJ8bPHdyRY86cGGXdeo0/'

# Videos: usados direto (ja sao leves)
$videos = @{
  'ath-09.mp4' = 'hf_20261112_053314_6e5d01b0-52cd-4d08-a341-68efa203b016.mp4'  # cartao de video da pagina FOX
}
# Imagens: PNG 2K do Higgsfield -> JPG na largura indicada
$images = @(
  @{ name = 'ath-06.jpg'; src = 'hf_20261112_063831_55369bb4-44fc-4969-8434-1ddefa40897b.png'; width = 2400 },  # colagem (O nome)
  @{ name = 'ath-20.jpg'; src = 'hf_20261112_235221_99760dc1-51d0-4c49-9a8e-3d33d204078f.png'; width = 2400 },  # mao com orbita (O nome)
  @{ name = 'ath-21.jpg'; src = 'hf_20261112_235222_d9765b86-56c0-4161-a56a-7967b03d1f3a.png'; width = 2400 }   # mecanismos (FOX)
)

function Save-Jpg($src, $dst, $width, $quality) {
  $img = [System.Drawing.Image]::FromFile($src)
  try {
    $w = [Math]::Min($width, $img.Width)
    $h = [int][Math]::Round($img.Height * $w / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)
    $bmp.Save($dst, $codec, $params)
    $g.Dispose(); $bmp.Dispose()
  } finally { $img.Dispose() }
}

foreach ($k in $videos.Keys) {
  $dst = Join-Path $out $k
  Write-Host "Baixando $k ..."
  Invoke-WebRequest -Uri ($cdn + $videos[$k]) -OutFile $dst -UseBasicParsing
}
foreach ($i in $images) {
  $png = Join-Path $tmp ($i.name + '.png')
  Write-Host "Baixando $($i.name) ..."
  Invoke-WebRequest -Uri ($cdn + $i.src) -OutFile $png -UseBasicParsing
  Save-Jpg $png (Join-Path $out $i.name) $i.width 84
}

Get-ChildItem $out | ForEach-Object { '{0,-14} {1,8:N0} KB' -f $_.Name, ($_.Length / 1KB) } | Write-Host
Write-Host "`nPronto. A midia esta em assets\media."
