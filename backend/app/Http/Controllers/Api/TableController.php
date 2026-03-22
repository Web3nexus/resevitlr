<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantTable;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index()
    {
        return response()->json(RestaurantTable::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|unique:restaurant_tables',
            'capacity' => 'required|integer|min:1',
            'status' => 'in:available,occupied,reserved,out_of_service',
        ]);

        $table = RestaurantTable::create($validated);
        return response()->json($table, 201);
    }

    public function updateStatus(Request $request, RestaurantTable $table)
    {
        $validated = $request->validate([
            'status' => 'required|in:available,occupied,reserved,out_of_service',
        ]);

        $table->update($validated);
        return response()->json($table);
    }
}
