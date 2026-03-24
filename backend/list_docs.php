<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$docs = \App\Models\SaaSDocumentation::all();
echo "Total Docs: " . $docs->count() . "\n";
foreach ($docs as $doc) {
    echo "ID: " . $doc->id . " | Title: " . $doc->title . " | Slug: " . $doc->slug . " | Published: " . ($doc->is_published ? 'YES' : 'NO') . "\n";
}
