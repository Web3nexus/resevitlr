<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display a listing of the menu categories with their items.
     */
    public function index()
    {
        return response()->json(
            MenuCategory::with('items.addons')->orderBy('sort_order')->get()
        );
    }

    /**
     * Store a newly created category.
     */
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'integer',
        ]);

        $category = MenuCategory::create($validated);
        return response()->json($category, 201);
    }

    /**
     * Store a newly created menu item.
     */
    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'menu_category_id' => 'required|exists:menu_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        $item = MenuItem::create($validated);
        return response()->json($item, 201);
    }
}
