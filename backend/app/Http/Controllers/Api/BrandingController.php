<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use Illuminate\Http\Request;

class BrandingController extends Controller
{
    public function index()
    {
        $settings = TenantSetting::all()->pluck('value', 'key')->toArray();
        
        // Fallback to the central tenant record's business name if not customized locally
        if (!isset($settings['business_name'])) {
            $settings['business_name'] = tenant('business_name');
        }
        
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = $request->all();
        
        foreach ($settings as $key => $value) {
            $storeValue = $value;
            if (is_array($value)) {
                $storeValue = json_encode($value);
            } elseif (is_bool($value)) {
                $storeValue = $value ? 'true' : 'false';
            }

            TenantSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $storeValue]
            );
        }
 
        return response()->json(['status' => 'success', 'settings' => $settings]);
    }
}
