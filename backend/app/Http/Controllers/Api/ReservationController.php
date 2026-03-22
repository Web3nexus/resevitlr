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
