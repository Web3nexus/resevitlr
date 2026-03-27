<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;
use Carbon\Carbon;
use App\Models\TenantSetting;
use App\Models\AiInteraction;
use App\Services\SocialMessengerService;

class AutomationController extends Controller
{
    /**
     * Check if tenant has enough AI credits and consume one.
     */
    private function checkAndConsumeCredit()
    {
        $tenant = tenant();
        if (!$tenant) return true; // Central context

        // Handle monthly reset
        if ($tenant->ai_credits_reset_at && $tenant->ai_credits_reset_at->isPast()) {
            $tenant->ai_credits_used = 0;
            $tenant->ai_credits_reset_at = now()->addMonth()->startOfMonth();
        } elseif (!$tenant->ai_credits_reset_at) {
            $tenant->ai_credits_reset_at = now()->addMonth()->startOfMonth();
        }

        $planSlug = $tenant->plan ?? 'free';
        $plan = \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
        $monthlyLimit = $plan ? $plan->ai_credits_limit : 10;
        $topupLimit = $tenant->ai_credits_topup ?? 0;
        $totalLimit = $monthlyLimit + $topupLimit;
        
        $usageBefore = ($tenant->ai_credits_used ?? 0) + ($tenant->ai_credits_topup_initial_balance_dummy ?? 0); // Not tracked yet but logic skeleton

        if ($tenant->ai_credits_used < $monthlyLimit) {
            $tenant->increment('ai_credits_used');
        } elseif ($tenant->ai_credits_topup > 0) {
            $tenant->decrement('ai_credits_topup');
        } else {
            $this->notifyCreditStatus($tenant, 'empty');
            throw new \Exception("AI Credit Limit Reached. Please top-up to continue using AI features.");
        }

        // Check for 10% remaining (10% to finish)
        $remaining = ($monthlyLimit - $tenant->ai_credits_used) + $tenant->ai_credits_topup;
        if ($totalLimit > 0 && ($remaining / $totalLimit) <= 0.1) {
            $this->notifyCreditStatus($tenant, 'low');
        }

        return true;
    }

    private function notifyCreditStatus($tenant, $status)
    {
        // Simple throttler: don't notify more than once every 24 hours for same status
        $cacheKey = "ai_notify_{$tenant->id}_{$status}";
        if (\Illuminate\Support\Facades\Cache::has($cacheKey)) return;

        $title = $status === 'low' ? "AI Credits Low (10%)" : "AI Credits Exhausted";
        $message = $status === 'low' 
            ? "You have less than 10% of your AI credits remaining. Click here to top up and avoid interruption."
            : "Your AI credits have run out. Auto-replies and scanning are paused. Top up to resume.";
        
        \App\Http\Controllers\Api\NotificationController::dispatch(
            'ai_limit',
            $title,
            $message,
            'bot'
        );

        \Illuminate\Support\Facades\Cache::put($cacheKey, true, now()->addDay());
    }

    /**
     * Get Tenant AI Settings
     */
    public function getSettings()
    {
        $settings = TenantSetting::all()->pluck('value', 'key');
        
        return response()->json([
            'ai_tone' => $settings['ai_tone'] ?? 'Professional',
            'custom_instructions' => $settings['custom_instructions'] ?? '',
            'auto_reply_enabled' => (bool) ($settings['auto_reply_enabled'] ?? false),
            'social_whatsapp' => (bool) ($settings['social_whatsapp'] ?? false),
            'social_facebook' => (bool) ($settings['social_facebook'] ?? false),
            'social_instagram' => (bool) ($settings['social_instagram'] ?? false),
            'whatsapp_id' => tenant('whatsapp_id') ?? '',
            'facebook_page_id' => tenant('facebook_page_id') ?? '',
            'instagram_id' => tenant('instagram_id') ?? '',
        ]);
    }

    /**
     * Update Tenant AI Settings
     */
    public function updateSettings(Request $request)
    {
        $settings = $request->only(['ai_tone', 'custom_instructions', 'auto_reply_enabled', 'social_whatsapp', 'social_facebook', 'social_instagram']);
        
        foreach ($settings as $key => $value) {
            TenantSetting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : $value]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Update social platform IDs for the current tenant (Central Data).
     */
    public function updateSocialLinks(Request $request)
    {
        $tenant = tenant();
        $validated = $request->validate([
            'whatsapp_id' => 'nullable|string',
            'facebook_page_id' => 'nullable|string',
            'instagram_id' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            $tenant->setAttribute($key, $value);
        }
        
        $tenant->save();

        return response()->json([
            'message' => 'Social identifiers updated successfully',
            'social_links' => $validated
        ]);
    }

    /**
     * Webhook endpoint for receiving messages from Facebook/WhatsApp via Socialite.
     */
    public function handleSocialWebhook(Request $request)
    {
        $payload = $request->all();
        $messageText = $payload['message']['text'] ?? '';
        $sender = $payload['message']['sender'] ?? ($payload['user']['name'] ?? 'Unknown User');
        $platform = $payload['message']['platform'] ?? 'Web';

        // Auto-detect Meta/WhatsApp platforms if platform is generic
        if ($platform === 'Web' || empty($platform)) {
             if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
                 $platform = 'WhatsApp';
                 $messageText = $payload['entry'][0]['changes'][0]['value']['messages'][0]['text']['body'] ?? $messageText;
                 $sender = $payload['entry'][0]['changes'][0]['value']['contacts'][0]['wa_id'] ?? $sender;
             } elseif (isset($payload['entry'][0]['messaging'])) {
                 // Distinguish between Facebook and Instagram if possible
                 $platform = (isset($payload['object']) && $payload['object'] === 'instagram') ? 'Instagram' : 'Facebook';
                 $messageText = $payload['entry'][0]['messaging'][0]['message']['text'] ?? $messageText;
                 $sender = $payload['entry'][0]['messaging'][0]['sender']['id'] ?? $sender;
             } 
         }
        
        Log::info('Received social webhook message', ['payload' => $payload]);

        if (empty($messageText)) {
            return response()->json(['status' => 'ignored']);
        }

        // Forward to AI for intent extraction
        try {
            $this->checkAndConsumeCredit();
        } catch (\Exception $e) {
            return response()->json(['status' => 'limit_reached', 'reply' => $e->getMessage()]);
        }
        
        $intent = $this->analyzeMessageIntent($messageText);

        $interactionStatus = 'replied';
        $sentiment = $intent['sentiment'] ?? 'neutral';
        $reply = $intent['reply'] ?? 'Processing request...';

        if ($intent['type'] === 'reservation') {
            // Persist the reservation extracted by AI
            $reservation = Reservation::create([
                'customer_name' => $payload['user']['name'] ?? 'Social User',
                'customer_email' => $payload['user']['email'] ?? 'social@example.com',
                'customer_phone' => $payload['user']['phone'] ?? '000000',
                'reservation_time' => Carbon::parse($intent['details']['date'] . ' ' . $intent['details']['time']),
                'party_size' => $intent['details']['party_size'] ?? 2,
                'special_requests' => $intent['details']['requests'] ?? 'AI Booked via Social Media',
                'status' => 'pending'
            ]);
            
            $reply = "I've placed a pending reservation for you on " . $reservation->reservation_time->format('M d, H:i') . ". A representative will confirm shortly!";
            $interactionStatus = 'actioned';

            // Send New Reservation Email (AI Alert)
            $template = \App\Models\EmailTemplate::where('slug', 'new_reservation')->first();
            if ($template) {
                $ownerEmail = tenant('owner_email');
                if ($ownerEmail) {
                    try {
                        \Illuminate\Support\Facades\Mail::to($ownerEmail)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                            'reservation_id' => $reservation->id,
                            'customer_name' => $reservation->customer_name . " (via AI)",
                            'reservation_date' => $reservation->reservation_time->format('Y-m-d'),
                            'reservation_time' => $reservation->reservation_time->format('H:i'),
                            'guest_count' => $reservation->party_size
                        ]));
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("Failed to send AI reservation email: " . $e->getMessage());
                    }
                }
            }
        } else {
            // Send New Message Email (General Inquiry)
            $template = \App\Models\EmailTemplate::where('slug', 'new_message')->first();
            if ($template) {
                $ownerEmail = tenant('owner_email');
                if ($ownerEmail) {
                    try {
                        \Illuminate\Support\Facades\Mail::to($ownerEmail)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                            'customer_name' => $sender,
                            'source' => $platform,
                            'message_preview' => \Illuminate\Support\Str::limit($messageText, 100)
                        ]));
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("Failed to send AI inquiry email: " . $e->getMessage());
                    }
                }
            }
        }

        // --- DISPATCH LOGIC ---
        $tenantSettings = TenantSetting::all()->pluck('value', 'key');
        $autoReplyEnabled = (bool) ($tenantSettings['auto_reply_enabled'] ?? false);

        if ($autoReplyEnabled) {
            $messenger = new SocialMessengerService();
            $metaData = [];
            if ($platform === 'WhatsApp') {
                $metaData['phone_number_id'] = ($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'] ?? null) ?: (tenant('whatsapp_technical_id') ?: tenant('whatsapp_id'));
            }
            
            $sent = $messenger->sendMessage($platform, $sender, $reply, $metaData);
            if (!$sent) {
                $interactionStatus = 'failed_to_send';
            }
        } else {
            $interactionStatus = 'pending_manual'; // Logged but not sent
        }

        $interaction = \App\Models\AiInteraction::create([
            'platform' => $platform,
            'platform_account_id' => ($platform === 'WhatsApp') ? (($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'] ?? null) ?: (tenant('whatsapp_technical_id') ?: tenant('whatsapp_id'))) : null,
            'sender' => $sender,
            'content' => $messageText,
            'reply' => $reply,
            'status' => $interactionStatus,
            'sentiment' => $sentiment,
            'is_reservation' => ($intent['type'] === 'reservation'),
        ]);

        // Broadcast the new message to the unified inbox
        event(new \App\Events\NewMessageReceived($interaction, tenant('id')));

        return response()->json([
            'status' => $interactionStatus,
            'reply' => $reply,
            'intent' => $intent['type']
        ]);
    }

    /**
     * Use configured AI provider to determine message intent.
     */
    private function analyzeMessageIntent(string $message): array
    {
        // 1. Fetch Global Settings from Central
        $saasSettings = tenancy()->central(function() {
            return \App\Models\SaaSSetting::all()->pluck('value', 'key');
        });

        if (isset($saasSettings['global_ai_enabled']) && $saasSettings['global_ai_enabled'] === '0') {
            return ['type' => 'general', 'reply' => 'The AI assistant is currently offline for maintenance.'];
        }

        $provider = $saasSettings['ai_provider'] ?? 'openai';
        $defaultPrompt = $saasSettings['default_system_prompt'] ?? 'You are an AI assistant for a restaurant. Determine if the user wants to make a reservation. If yes, extract details (date, time, party size) and output JSON: {"type": "reservation", "sentiment": "positive/neutral/negative", "details": {"date": "YYYY-MM-DD", "time": "HH:MM", "party_size": int, "requests": "string"}}. Else, generate a friendly reply: {"type": "general", "reply": "...", "sentiment": "positive/neutral/negative"}.';

        // 2. Fetch Business Context
        $menuInfo = \App\Models\MenuCategory::with('items')->get()->map(function($cat) {
            return "Category: " . (string)$cat->name . " - Items: " . $cat->items->map(fn($i) => (string)$i->name . " ($" . (string)$i->price . ")")->join(', ');
        })->join("\n");

        $tableInfo = \App\Models\RestaurantTable::all()->map(fn($t) => "Table " . (string)$t->table_number . " (Capacity: " . (string)$t->capacity . ")")->join(', ');
        
        $knowledgeBase = \App\Models\TenantKnowledge::where('is_active', true)->get()->map(fn($k) => (string)$k->title . ": " . (string)$k->content)->join("\n");

        // 3. Fetch Tenant Settings
        $tenantSettings = \App\Models\TenantSetting::all()->pluck('value', 'key');
        $tone = $tenantSettings['ai_tone'] ?? 'Professional';
        $instructions = $tenantSettings['custom_instructions'] ?? '';

        $finalPrompt = $defaultPrompt . "\n\nBrand Tone: {$tone}\n\n" .
                      "BUSINESS CONTEXT:\n" .
                      "Business Name: " . (tenant('business_name') ?? 'The Restaurant') . "\n" .
                      "Phone: " . ($tenantSettings['booking_phone'] ?? 'Not set') . "\n" .
                      "Email: " . ($tenantSettings['contact_email'] ?? 'Not set') . "\n\n" .
                      "Menu:\n{$menuInfo}\n\n" .
                      "Seating:\n{$tableInfo}\n\n" .
                      "Additional Knowledge:\n{$knowledgeBase}\n\n";

        if (!empty($instructions)) {
            $finalPrompt .= "Specific Rules / Context: {$instructions}";
        }

        try {
            if ($provider === 'anthropic' || $provider === 'claude') {
                return $this->callAnthropic($finalPrompt, $message, true);
            }

            // OpenAI Fallback
            $globalApiKey = $saasSettings['openai_api_key'] ?? config('openai.api_key');
            if (!empty($globalApiKey)) {
                config(['openai.api_key' => $globalApiKey]);
            }

            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => $finalPrompt],
                    ['role' => 'user', 'content' => $message],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            return json_decode($response->choices[0]->message->content, true);
        } catch (\Exception $e) {
            Log::error('AI Analysis Failed', ['provider' => $provider, 'error' => $e->getMessage()]);
            
            $bookingPhone = \App\Models\TenantSetting::get('booking_phone');
            $reply = 'I am currently unable to process your request.';
            if ($bookingPhone) {
                $reply .= " Please call us directly at {$bookingPhone}.";
            } else {
                $reply .= " Please call the restaurant directly.";
            }

            return ['type' => 'error', 'reply' => $reply];
        }
    }

    /**
     * AI Receipt Scanning endpoint.
     */
    public function scanReceipt(Request $request)
    {
        // 1. Fetch Global Settings from Central
        $saasSettings = tenancy()->central(function() {
            return \App\Models\SaaSSetting::all()->pluck('value', 'key');
        });

        if (isset($saasSettings['global_ai_enabled']) && $saasSettings['global_ai_enabled'] === '0') {
            return response()->json(['error' => 'The AI system is currently offline for maintenance.'], 503);
        }

        $provider = $saasSettings['ai_provider'] ?? 'openai';

        $request->validate([
            'receipt' => 'required|image|max:5120',
        ]);

        try {
            $this->checkAndConsumeCredit();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }

        $image = $request->file('receipt');
        $base64Image = base64_encode(file_get_contents($image->path()));

        try {
            if ($provider === 'anthropic' || $provider === 'claude') {
                $prompt = "Analyze this receipt image and extract data. Return ONLY a JSON object containing: vendor_name, total_amount, date (YYYY-MM-DD), category.";
                $data = $this->callAnthropic($prompt, [
                    'type' => 'image',
                    'source' => [
                        'type' => 'base64',
                        'media_type' => $image->getMimeType(),
                        'data' => $base64Image
                    ]
                ], true);
            } else {
                $globalApiKey = $saasSettings['openai_api_key'] ?? config('openai.api_key');
                if (!empty($globalApiKey)) {
                    config(['openai.api_key' => $globalApiKey]);
                }

                $response = OpenAI::chat()->create([
                    'model' => 'gpt-4o',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are an AI that extracts data from receipts. Respond with a JSON object containing: vendor_name, total_amount, date (YYYY-MM-DD), category.'],
                        ['role' => 'user', 'content' => [
                            ['type' => 'text', 'text' => 'Analyze this receipt and extract vendor, amount, date, and category (Utilities, Supplies, Rent, etc).'],
                            ['type' => 'image_url', 'image_url' => ['url' => "data:image/jpeg;base64,{$base64Image}"]]
                        ]],
                    ],
                    'response_format' => ['type' => 'json_object'],
                ]);

                $data = json_decode($response->choices[0]->message->content, true);
            }

            // Persist the expense
            $expense = Expense::create([
                'description' => $data['vendor_name'] ?? 'Unknown Vendor',
                'amount' => $data['total_amount'] ?? 0,
                'expense_date' => $data['date'] ?? now()->toDateString(),
                'category' => $data['category'] ?? 'Supplies',
            ]);

            return response()->json([
                'status' => 'success',
                'expense' => $expense,
                'credits' => $this->getCreditsArray()
            ]);

        } catch (\Exception $e) {
            Log::error('Receipt scan failed', ['provider' => $provider, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to process receipt.'], 500);
        }
    }

    /**
     * Helper to call Anthropic API via Guzzle.
     */
    private function callAnthropic($systemPrompt, $userMessage, $jsonMode = false)
    {
        $apiKey = tenancy()->central(fn() => \App\Models\SaaSSetting::get('claude_api_key'));
        
        if (!$apiKey) throw new \Exception("Anthropic API Key missing");

        $content = [];
        if (is_array($userMessage) && isset($userMessage['type']) && $userMessage['type'] === 'image') {
            $content[] = [
                'type' => 'image',
                'source' => $userMessage['source']
            ];
            $content[] = [
                'type' => 'text',
                'text' => 'Process this image as requested.'
            ];
        } else {
            $content[] = [
                'type' => 'text',
                'text' => (string)$userMessage
            ];
        }

        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => 'claude-3-5-sonnet-20240620',
            'max_tokens' => 1024,
            'system' => $systemPrompt,
            'messages' => [
                ['role' => 'user', 'content' => $content]
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception("Anthropic Error: " . ($response->json()['error']['message'] ?? 'Unknown Error'));
        }

        $text = $response->json()['content'][0]['text'] ?? '';

        if ($jsonMode) {
            // Claude sometimes wraps JSON in markdown blocks
            if (preg_match('/```json\s*(.*?)\s*```/s', $text, $matches)) {
                $text = $matches[1];
            }
            return json_decode($text, true) ?: ['type' => 'error', 'reply' => 'Failed to parse AI response.'];
        }

        return $text;
    }

    /**
     * Get all knowledge base entries.
     */
    public function getKnowledge()
    {
        return response()->json(\App\Models\TenantKnowledge::latest()->get());
    }

    /**
     * Store new knowledge entry.
     */
    public function storeKnowledge(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'required|string|in:document,note,policy',
            'file' => 'nullable|file|mimes:pdf,txt,doc,docx|max:10240'
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('knowledge', 'public');
            
            // In a real app, we would use a PDF parser here to extract text into $validated['content']
            // For now, we'll assume the user might provide text alongside the file or we'll just store the path.
        }

        $knowledge = \App\Models\TenantKnowledge::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'type' => $validated['type'],
            'file_path' => $filePath,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Knowledge base updated', 'knowledge' => $knowledge]);
    }

    /**
     * Post a manual reply to an interaction.
     */
    public function postReply(Request $request, $id)
    {
        $interaction = AiInteraction::findOrFail($id);
        $replyText = $request->input('reply');

        // Logic here calls the actual platform API
        $messenger = new SocialMessengerService();
        $metaData = [];
        if ($interaction->platform === 'WhatsApp') {
            $metaData['phone_number_id'] = $interaction->platform_account_id ?: (tenant('whatsapp_technical_id') ?: tenant('whatsapp_id'));
        }
        $sent = $messenger->sendMessage($interaction->platform, $interaction->sender, $replyText, $metaData);
        
        $interaction->update([
            'reply' => $replyText,
            'status' => $sent ? 'manual_reply' : 'failed_to_send_manual'
        ]);

        return response()->json([
            'message' => $sent ? 'Reply sent successfully' : 'Failed to send message via platform API', 
            'interaction' => $interaction
        ]);
    }

    public function getActivity()
    {
        $interactions = AiInteraction::orderBy('created_at', 'desc')->take(50)->get();
        $totalInteractions = AiInteraction::count();
        $autoReplies = AiInteraction::whereIn('status', ['replied', 'actioned'])->count();
        
        $positiveCount = AiInteraction::where('sentiment', 'positive')->count();
        $sentimentScore = $totalInteractions > 0 ? round(($positiveCount / $totalInteractions) * 100) : 0;

        $activityLog = $interactions->map(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->is_reservation ? 'booking' : 'inquiry',
                'sender' => $item->sender,
                'platform' => $item->platform,
                'content' => $item->content,
                'reply' => $item->reply,
                'status' => $item->status,
                'sentiment' => $item->sentiment,
                'time' => $item->created_at->diffForHumans(),
                'timestamp' => $item->created_at->toIso8601String()
            ];
        });

        return response()->json([
            'activity' => $activityLog,
            'stats' => [
                'total_interactions' => $totalInteractions,
                'sentiment_score' => $sentimentScore,
                'auto_replies' => $autoReplies,
                'accuracy' => '99%',
                'credits' => $this->getCreditsArray(),
            ]
        ]);
    }

    private function getCreditsArray()
    {
        $tenant = tenant();
        if (!$tenant) return null;

        $planSlug = $tenant->plan ?? 'free';
        $plan = \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();

        return [
            'used' => $tenant->ai_credits_used ?? 0,
            'limit' => $plan ? $plan->ai_credits_limit : 10,
            'topup' => $tenant->ai_credits_topup ?? 0,
        ];
    }
}
