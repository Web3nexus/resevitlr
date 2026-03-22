<?php

namespace Database\Seeders;

use App\Models\Translation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class TranslationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locales = ['en', 'fr', 'de', 'es'];
        
        foreach ($locales as $locale) {
            $path = base_path("../frontend/src/locales/{$locale}.json");
            
            if (File::exists($path)) {
                $json = File::get($path);
                $data = json_decode($json, true);
                
                if ($data) {
                    $this->importTranslations($locale, $data);
                }
            }
        }
    }

    /**
     * Import nested translations into the database.
     */
    private function importTranslations(string $locale, array $data, string $prefix = ''): void
    {
        foreach ($data as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;

            if (is_array($value)) {
                // If it's a first-level key, it's the 'group'
                if ($prefix === '') {
                    $this->importTranslations($locale, $value, $key);
                } else {
                    // Otherwise it's still part of the same group but nested key
                    $this->importTranslations($locale, $value, $fullKey);
                }
            } else {
                // Split the fullKey into group and actual key
                $parts = explode('.', $fullKey);
                $group = array_shift($parts);
                $actualKey = implode('.', $parts);

                // If no parts left, it's a root key (common)
                if (empty($actualKey)) {
                    $actualKey = $group;
                    $group = 'common';
                }

                Translation::updateOrCreate(
                    [
                        'locale' => $locale,
                        'group' => $group,
                        'key' => $actualKey,
                    ],
                    [
                        'value' => $value,
                    ]
                );
            }
        }
    }
}
