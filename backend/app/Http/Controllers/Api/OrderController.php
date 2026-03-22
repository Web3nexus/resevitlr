<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\NotificationController;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index()
    {
        return response()->json(Order::with('items.menuItem', 'table', 'staff')->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a new order (POS Checkout).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id',
            'staff_profile_id' => 'nullable|exists:staff_profiles,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.addons' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated) {
            $order = Order::create([
                'restaurant_table_id' => $validated['restaurant_table_id'] ?? null,
                'staff_profile_id' => $validated['staff_profile_id'] ?? null,
                'total_amount' => 0, // Will update after items
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            $total = 0;

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::find($itemData['menu_item_id']);
                $subtotal = $menuItem->price * $itemData['quantity'];
                
                $order->items()->create([
                    'menu_item_id' => $itemData['menu_item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $menuItem->price,
                    'subtotal' => $subtotal,
                    'addons' => $itemData['addons'] ?? null,
                ]);

                $total += $subtotal;
            }

            $order->update(['total_amount' => $total]);

            // Dispatch real notification
            NotificationController::dispatch(
                'order',
                'New Order Placed',
                'A new order of $' . number_format($total, 2) . ' has been submitted.',
                'shopping-bag',
                $order->id
            );

            return response()->json($order->load('items.menuItem'), 201);
        });
    }

    /**
     * Update order status/payment.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,processing,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,partially_paid,paid',
        ]);

        $order->update($validated);

        // Notify on completion
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            NotificationController::dispatch(
                'order',
                'Order Completed',
                'Order #' . $order->id . ' has been marked as completed.',
                'check-circle',
                $order->id
            );
        }

        return response()->json($order);
    }
}
