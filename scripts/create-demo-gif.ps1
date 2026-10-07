Add-Type -AssemblyName System.Drawing

$outputPath = Join-Path $PSScriptRoot '..\public\demo.gif'
$outputPath = [System.IO.Path]::GetFullPath($outputPath)
$frames = @()
$values = @(66, 28, 88, 42, 18, 74, 35, 96, 52, 24, 82, 45, 12, 61, 31, 90, 38, 70, 20, 56)

function Add-Snapshot([int[]]$snapshot, [int[]]$active = @(), [int[]]$complete = @()) {
  $script:frames += ,@{ Values = $snapshot.Clone(); Active = $active; Complete = $complete }
}

for ($step = 0; $step -lt $values.Count; $step++) {
  $minimum = $step
  for ($index = $step + 1; $index -lt $values.Count; $index++) {
    if ($values[$index] -lt $values[$minimum]) { $minimum = $index }
  }
  if ($minimum -ne $step) { $values[$step], $values[$minimum] = $values[$minimum], $values[$step] }
  $complete = if ($step -gt 0) { 0..($step - 1) } else { @() }
  Add-Snapshot $values @($step, $minimum) $complete
}

$sorted = $values.Clone()
for ($index = 0; $index -lt $sorted.Count; $index++) {
  Add-Snapshot $sorted @() (0..$index)
}

$width = 720
$height = 400
$images = @()
$fontTitle = [System.Drawing.Font]::new('Arial', 18, [System.Drawing.FontStyle]::Bold)
$fontSmall = [System.Drawing.Font]::new('Consolas', 10)
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(243, 241, 238))
$muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(118, 118, 118))
$red = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(239, 45, 30))
$green = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(100, 214, 135))
$background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(9, 9, 9))

foreach ($frame in $frames) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::FromArgb(9, 9, 9))
  $graphics.FillRectangle($background, 0, 0, $width, $height)
  $graphics.DrawString('SORT WITH SOUND', $fontTitle, $white, 28, 22)
  $graphics.DrawString('SELECTION SORT / GREEN PASS', $fontSmall, $muted, 30, 55)
  $barWidth = 28
  $gap = 6
  $baseY = 350
  for ($index = 0; $index -lt $frame.Values.Count; $index++) {
    $value = $frame.Values[$index]
    $barHeight = [int](($value / 100) * 245)
    $x = 24 + ($index * ($barWidth + $gap))
    $y = $baseY - $barHeight
    $brush = $white
    if ($frame.Complete -contains $index) { $brush = $green }
    if ($frame.Active -contains $index) { $brush = $red }
    $graphics.FillRectangle($brush, $x, $y, $barWidth, $barHeight)
  }
  $graphics.DrawString('REAL-TIME ALGORITHM VISUALIZER', $fontSmall, $muted, 30, 370)
  $graphics.Dispose()
  $images += $bitmap
}

$gifEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/gif'
$saveParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$saveParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::SaveFlag, [long][System.Drawing.Imaging.EncoderValue]::MultiFrame)
$images[0].Save($outputPath, $gifEncoder, $saveParameters)
$saveParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::SaveFlag, [long][System.Drawing.Imaging.EncoderValue]::FrameDimensionTime)
for ($index = 1; $index -lt $images.Count; $index++) { $images[0].SaveAdd($images[$index], $saveParameters) }
$saveParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::SaveFlag, [long][System.Drawing.Imaging.EncoderValue]::Flush)
$images[0].SaveAdd($saveParameters)

foreach ($image in $images) { $image.Dispose() }
$fontTitle.Dispose(); $fontSmall.Dispose(); $white.Dispose(); $muted.Dispose(); $red.Dispose(); $green.Dispose(); $background.Dispose()
Write-Output "Created $outputPath"
