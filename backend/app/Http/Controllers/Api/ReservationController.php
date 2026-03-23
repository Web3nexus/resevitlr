<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\NotificationController;

class ReservationController extends Controller
{
    /**
     * Display a listing of reservations.
     */
    public function index()
    {
        return response()->json(Reservation::with('table')->orderBy('reservation_time')->get());
    }

    /**
     * Store a newly created reservation.
     */
    public function store(Request $request)
    {
        // 1. Check Monthly Reservation Limit
        $tenant = tenant();
        $planSlug = $tenant->plan ?? 'free';
        
        $plan = \Stancl\Tenancy\Facades\Tenancy::central(function () use ($planSlug) {
            return \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
        });

        if ($plan && $plan->reservation_limit !== null) {
            $monthStart = \Carbon\Carbon::now()->startOfMonth();
            $monthEnd = \Carbon\Carbon::now()->endOfMonth();
            
            $count = Reservation::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            
            if ($count >= $plan->reservation_limit) {
                return response()->json([
                    'error' => 'limit_reached',
                    'message' => "Monthly reservation limit of {$plan->reservation_limit} has been reached for your {$plan->name} plan.",
                    'limit' => $plan->reservation_limit
                ], 403);
            }
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'reservation_time' => 'required|date|after:now',
            'party_size' => 'required|integer|min:1',
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id',
            'special_requests' => 'nullable|string',
        ]);

        $reservation = Reservation::create($validated);

        // Send New Reservation Email
        $template = \App\Models\EmailTemplate::where('slug', 'new_reservation')->first();
        if ($template) {
            try {
                \Illuminate\Support\Facades\Mail::to($validated['customer_email'])->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                    'reservation_id' => $reservation->id,
                    'customer_name' => $reservation->customer_name,
                    'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                    'reservation_time' => $reservation->reservation_time->format('H:i'),
                    'guest_count' => $reservation->party_size
                ]));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send reservation email: " . $e->getMessage());
            }
        }

        // Dispatch real notification
        NotificationController::dispatch(
            'reservation',
            'New Reservation',
            $validated['customer_name'] . ' booked a table for ' . $validated['party_size'] . ' guests.',
            'calendar',
            $reservation->id
        );

        return response()->json($reservation, 201);
    }

    /**
     * Update reservation status.
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $reservation->update($validated);

        if ($validated['status'] === 'confirmed') {
            NotificationController::dispatch(
                'reservation',
                'Reservation Confirmed',
                'Booking for ' . $reservation->customer_name . ' has been confirmed.',
                'check-circle',
                $reservation->id
            );
        } elseif ($validated['status'] === 'cancelled') {
            NotificationController::dispatch(
                'reservation',
                'Reservation Cancelled',
                'Booking for ' . $reservation->customer_name . ' was cancelled.',
                'x-circle',
                $reservation->id
            );
        }

        return response()->json($reservation);
    }
}
