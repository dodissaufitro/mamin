<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

$tables = [
    'users' => 'User',
    'roles' => 'Role',
    'nama_penyedia' => 'Nama Penyedia'
];

$dir = storage_path('app/builder/schemas');

foreach ($tables as $table => $resourceName) {
    if (!Schema::hasTable($table)) {
        echo "Table {$table} not found.\n";
        continue;
    }
    
    $columns = Schema::getColumnListing($table);
    $fields = [];
    foreach ($columns as $col) {
        if (in_array($col, ['id', 'created_at', 'updated_at'])) continue;
        
        $type = Schema::getColumnType($table, $col);
        $fieldType = 'string';
        if ($type === 'text') $fieldType = 'text';
        elseif (in_array($type, ['integer', 'bigint', 'smallint', 'decimal', 'float'])) $fieldType = 'integer';
        elseif (in_array($type, ['date', 'datetime', 'timestamp'])) $fieldType = 'date';
        elseif ($type === 'boolean' || $type === 'tinyint') $fieldType = 'boolean';
        
        $fields[] = [
            'id' => uniqid(),
            'name' => $col,
            'type' => $fieldType
        ];
    }
    
    $data = [
        'resource_name' => str_replace(' ', '', ucwords($resourceName)),
        'has_chart' => false,
        'has_summary' => false,
        'fields' => $fields
    ];
    
    $fileName = Str::kebab($resourceName) . '.json';
    File::put("{$dir}/{$fileName}", json_encode($data, JSON_PRETTY_PRINT));
    echo "Saved schema for {$resourceName}\n";
}
