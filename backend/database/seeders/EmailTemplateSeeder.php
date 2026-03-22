<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'slug'      => '2fa_code',
                'subject'   => 'Your Security Code',
                'content'   => "Hello {name},\n\nYour security verification code is: {code}\n\nThis code will expire in 10 minutes. If you did not request this, please secure your account immediately.",
                'variables' => ['name', 'code'],
            ],
            [
                'slug'      => 'welcome_email',
                'subject'   => 'Welcome to {platform_name}!',
                'content'   => "Hi {name},\n\nWelcome to {platform_name}! Your account has been successfully created. You can now access your dashboard and start managing your business.",
                'variables' => ['name', 'platform_name'],
            ],
            [
                'slug'      => 'password_reset',
                'subject'   => 'Reset Your Password',
                'content'   => "Hello {name},\n\nYou are receiving this email because we received a password reset request for your account.\n\nYour reset link: {reset_link}\n\nIf you did not request a password reset, no further action is required.",
                'variables' => ['name', 'reset_link'],
            ],
            [
                'slug'      => 'new_reservation',
                'subject'   => 'New Reservation Alert – {reservation_id}',
                'content'   => "Notification: You have a new booking from {customer_name}.\n\nDate: {reservation_date}\nTime: {reservation_time}\nGuests: {guest_count}\n\nPlease check your reservation hub for details.",
                'variables' => ['reservation_id', 'customer_name', 'reservation_date', 'reservation_time', 'guest_count'],
            ],
            [
                'slug'      => 'new_order',
                'subject'   => 'New Order Received! – {order_number}',
                'content'   => "System Node: A new order of {total_amount} has been logged for {business_name}.\n\nItems: {items_count}\nSource: {source}\n\nPlease prepare the order for processing.",
                'variables' => ['order_number', 'total_amount', 'business_name', 'items_count', 'source'],
            ],
            [
                'slug'      => 'staff_registration',
                'subject'   => 'Welcome to the Team, {name}',
                'content'   => "Welcome aboard!\n\nYour staff account for {business_name} at {platform_name} is ready.\n\nLogin URL: {login_url}\nTemporary PIN for setup: {pin}\n\nPlease log in and complete your profile security setup.",
                'variables' => ['name', 'business_name', 'platform_name', 'login_url', 'pin'],
            ],
            [
                'slug'      => 'new_message',
                'subject'   => 'New Message from {customer_name}',
                'content'   => "You have a new message via {source}:\n\n\"{message_preview}\"\n\nPlease reply from your communication hub.",
                'variables' => ['customer_name', 'source', 'message_preview'],
            ],
            [
                'slug'      => 'high_load_alert',
                'subject'   => 'Critical System Alert: High Infrastructure Load',
                'content'   => "Warning: {node_name} is experiencing critical load levels.\n\nCPU Usage: {cpu_percent}%\nMemory Usage: {mem_percent}%\n\nPlease check server logs immediately.",
                'variables' => ['node_name', 'cpu_percent', 'mem_percent'],
            ],
            [
                'slug'      => 'payment_success',
                'subject'   => 'Subscription Activated – {business_name}',
                'content'   => "Success! Your payment for the {plan_name} plan has been processed.\n\nInvoice ID: {invoice_id}\nAmount: {amount}\n\nThank you for choosing {platform_name}!",
                'variables' => ['business_name', 'plan_name', 'invoice_id', 'amount', 'platform_name'],
            ]
        ];

        foreach ($templates as $data) {
            \App\Models\EmailTemplate::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
