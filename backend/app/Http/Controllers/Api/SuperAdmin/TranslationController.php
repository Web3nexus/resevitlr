<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TranslationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Translation::query();

        if ($request->has('locale')) {
            $query->where('locale', $request->locale);
        }

        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('key', 'like', "%{$request->search}%")
                  ->orWhere('value', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->orderBy('group')->orderBy('key')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'locale' => 'required|string',
            'group' => 'required|string',
            'key' => 'required|string',
            'value' => 'nullable|string',
        ]);

        $translation = Translation::updateOrCreate(
            ['locale' => $data['locale'], 'group' => $data['group'], 'key' => $data['key']],
            ['value' => $data['value']]
        );

        $this->clearCache($data['locale']);

        return response()->json($translation, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $translation = Translation::findOrFail($id);
        
        $data = $request->validate([
            'value' => 'nullable|string',
        ]);

        $translation->update($data);
        
        $this->clearCache($translation->locale);

        return response()->json($translation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $translation = Translation::findOrFail($id);
        $locale = $translation->locale;
        $translation->delete();
        
        $this->clearCache($locale);

        return response()->json(['message' => 'Translation deleted successfully']);
    }

    /**
     * Fetch translations for the frontend in a flat JSON format.
     */
    public function fetch($locale)
    {
        // Use central context to fetch translations from the central DB.
        // We avoid Cache here because Stancl Tenancy attempts to tag cache calls 
        // in a tenant context, which fails on drivers that don't support tagging (file/database).
        return \Stancl\Tenancy\Facades\Tenancy::central(function() use ($locale) {
            $translations = Translation::where('locale', $locale)->get();
            
            $result = [];
            foreach ($translations as $translation) {
                $group = $translation->group;
                $key = $translation->key;
                $value = $translation->value;

                // Decode JSON values if applicable
                if (is_string($value) && (str_starts_with($value, '{') || str_starts_with($value, '['))) {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $value = $decoded;
                    }
                }

                if (!isset($result[$group]) || !is_array($result[$group])) {
                    $result[$group] = [];
                }
                
                // Use Arr::set to properly reconstruct nested json from dotted keys
                \Illuminate\Support\Arr::set($result[$group], $key, $value);
            }

            return response()->json($result, 200, [], empty($result) ? JSON_FORCE_OBJECT : 0);
        });
    }

    /**
     * Clear the translation cache for a specific locale.
     */
    protected function clearCache($locale)
    {
        Cache::forget("translations_{$locale}");
    }
}
