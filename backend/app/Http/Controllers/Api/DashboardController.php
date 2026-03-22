<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Expense;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        try {
            $today = Carbon::today();
            
            $totalRevenue = Order::sum('total_amount');
            $orderCount = Order::count();
            $aov = $orderCount > 0 ? $totalRevenue / $orderCount : 0;
            
            $activeReservations = Reservation::where('status', 'confirmed')
                ->whereDate('reservation_time', $today)
                ->count();
                
            $totalExpenses = Expense::sum('amount');
            
            // Recent orders
            $recentOrders = Order::orderBy('created_at', 'desc')->limit(1)->get();
            
            // Tables
            $tables = \App\Models\RestaurantTable::all();

            // Real Top Items
            $topItems = OrderItem::query()
                ->select('menu_item_id', \DB::raw('SUM(quantity) as total_qty'))
                ->groupBy('menu_item_id')
                ->orderBy('total_qty', 'desc')
                ->limit(4)
                ->with('menuItem')
                ->get();
                
            $maxQty = $topItems->max('total_qty') ?: 1;
            
            $formattedTopItems = $topItems->map(function ($item, $index) use ($maxQty) {
                $colors = ['bg-blue-600', 'bg-blue-500', 'bg-emerald-500', 'bg-slate-300'];
                return [
                    'name' => $item->menuItem->name ?? 'Unknown',
                    'progress' => round(($item->total_qty / $maxQty) * 100) . '%',
                    'color' => $colors[$index] ?? 'bg-blue-400'
                ];
            });
            
            return response()->json([
                'metrics' => [
                    'total_revenue' => (float)$totalRevenue,
                    'aov' => (float)$aov,
                    'active_reservations' => (int)$activeReservations,
                    'total_expenses' => (float)$totalExpenses,
                    'net_profit' => (float)($totalRevenue - $totalExpenses)
                ],
                'recent_orders' => $recentOrders,
                'tables' => $tables,
                'top_items' => $formattedTopItems
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Dashboard Stats Error: ' . $e->getMessage());
            return response()->json([
                'metrics' => ['total_revenue' => 0, 'aov' => 0, 'active_reservations' => 0, 'total_expenses' => 0, 'net_profit' => 0],
                'recent_orders' => [],
                'tables' => [],
                'top_items' => []
            ]);
        }
    }
}
