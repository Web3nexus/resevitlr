<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportTranslations extends Command
{
    protected $signature = 'translations:import';
    protected $description = 'Import JSON translations from frontend into database';

    public function handle()
    {
        $frontendLocalesPath = realpath(base_path('../frontend/src/locales'));
        
        if (!$frontendLocalesPath) {
            $this->error("Could not find frontend locales path.");
            return 1;
        }

        $files = glob($frontendLocalesPath . '/*.json');

        foreach ($files as $file) {
            $locale = basename($file, '.json');
            $this->info("Importing locale: {$locale}");
            
            $json = json_decode(file_get_contents($file), true);
            
            if (!$json) {
                $this->error("Invalid JSON in {$file}");
                continue;
            }

            foreach ($json as $group => $items) {
                $this->importItems($locale, $group, $items);
            }
        }

        $this->info("Translation import completed.");
        return 0;
    }

    private function importItems($locale, $group, $items, $prefix = '')
    {
        if (is_array($items)) {
            foreach ($items as $key => $value) {
                $fullKey = $prefix ? "{$prefix}.{$key}" : $key;
                if (is_array($value)) {
                    $this->importItems($locale, $group, $value, $fullKey);
                } else {
                    \App\Models\Translation::updateOrCreate(
                        ['locale' => $locale, 'group' => $group, 'key' => $fullKey],
                        ['value' => $value]
                    );
                }
            }
        } else {
            \App\Models\Translation::updateOrCreate(
                ['locale' => $locale, 'group' => 'general', 'key' => $group],
                ['value' => $items]
            );
        }
    }
}
