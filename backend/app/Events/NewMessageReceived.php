<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $interaction;
    public $tenant_id;

    /**
     * Create a new event instance.
     */
    public function __construct($interaction, $tenant_id)
    {
        $this->interaction = $interaction;
        $this->tenant_id = $tenant_id;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('tenant.' . $this->tenant_id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'interaction' => [
                'id' => $this->interaction->id,
                'type' => $this->interaction->is_reservation ? 'booking' : 'inquiry',
                'sender' => $this->interaction->sender,
                'platform' => $this->interaction->platform,
                'content' => $this->interaction->content,
                'reply' => $this->interaction->reply,
                'status' => $this->interaction->status,
                'sentiment' => $this->interaction->sentiment,
                'time' => $this->interaction->created_at->diffForHumans(),
                'timestamp' => $this->interaction->created_at->toIso8601String()
            ]
        ];
    }
}
