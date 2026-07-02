<?php
$dir = new RecursiveDirectoryIterator(__DIR__ . '/resources/js');
$ite = new RecursiveIteratorIterator($dir);
foreach($ite as $file) {
    if ($file->isFile() && in_array($file->getExtension(), ['ts', 'tsx'])) {
        $content = file_get_contents($file->getPathname());
        if (strpos($content, 'Makan Minum Rapat') !== false) {
            $content = str_replace('Makan Minum Rapat', 'Makan Minum', $content);
            file_put_contents($file->getPathname(), $content);
            echo "Replaced in " . $file->getPathname() . "\n";
        }
        if (strpos($content, 'makan minum rapat') !== false) {
            $content = str_replace('makan minum rapat', 'makan minum', $content);
            file_put_contents($file->getPathname(), $content);
            echo "Replaced (lowercase) in " . $file->getPathname() . "\n";
        }
    }
}
