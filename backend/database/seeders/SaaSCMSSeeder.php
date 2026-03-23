<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SaaSBlog;
use App\Models\SaaSCustomerStory;
use App\Models\SaaSDocumentation;
use App\Models\SaaSHelpArticle;

class SaaSCMSSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SaaSBlog::truncate();
        SaaSCustomerStory::truncate();
        SaaSDocumentation::truncate();
        SaaSHelpArticle::truncate();

        // Seed Blogs
        SaaSBlog::create([
            'title' => 'Optimizing Table Turnover in the Digital Age',
            'slug' => 'optimizing-table-turnover',
            'excerpt' => 'How the right tech stack can help you serve more guests without rushing them.',
            'content' => '# Optimizing Table Turnover\n\nTable turnover is the lifeblood of a busy restaurant. In this post, we explore how Resevit helps you manage floor timing effectively, ensuring guests feel welcome while keeping the waitlist moving.',
            'author' => 'Michael Ross, Product Lead',
            'image_url' => 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
            'is_published' => true,
            'published_at' => now()->subDays(2),
        ]);

        SaaSBlog::create([
            'title' => 'Resevit 2.0: AI-Powered Menu Engineering',
            'slug' => 'ai-powered-menu-engineering',
            'excerpt' => 'Our new AI tool helps you identify your most profitable dishes in seconds.',
            'content' => '# AI-Powered Menu Engineering\n\nResevit 2.0 introduces advanced analytics to help you understand which menu items are driving your revenue and which are taking up valuable space. Use AI to optimize your offerings for maximum profit.',
            'author' => 'Sarah Chen, Head of Product',
            'image_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
            'is_published' => true,
            'published_at' => now()->subDays(5),
        ]);

        // Seed Customer Stories
        SaaSCustomerStory::create([
            'client_name' => 'The Grill House',
            'slug' => 'the-grill-house-success',
            'logo_url' => null,
            'metrics' => [
                'no_shows' => '-40%',
                'revenue_increase' => '+12%',
                'staff_efficiency' => '+25%'
            ],
            'content' => 'The Grill House, a premium steakhouse, was struggling with high no-show rates on weekend nights. After implementing Resevit\'s automated SMS confirmation system, they saw an immediate 40% reduction in missed reservations.',
            'is_published' => true,
        ]);

        SaaSCustomerStory::create([
            'client_name' => 'Bistro 21',
            'slug' => 'bistro-21-case-study',
            'logo_url' => null,
            'metrics' => [
                'table_turnover' => '+20%',
                'online_bookings' => '85%',
            ],
            'content' => 'Bistro 21 transitioned from manual pen-and-paper booking to Resevit Central. The result was a smoother floor operation and a significant increase in online bookings through their own website channel.',
            'is_published' => true,
        ]);

        // Seed Documentation - Product Manuals
        SaaSDocumentation::create([
            'title' => 'Getting Started: Your First 24 Hours',
            'slug' => 'getting-started-24-hours',
            'category' => 'Setup Guide',
            'order_index' => 1,
            'content' => "# Your First 24 Hours\n\nWelcome to Resevit. This guide covers the essential steps to get your restaurant live: configuring your floor plan, adding your first menu items, and setting up your staff accounts.",
            'is_published' => true,
        ]);

        SaaSDocumentation::create([
            'title' => 'Setting Up Your Floor Plan',
            'slug' => 'setup-floor-plan',
            'category' => 'Configuration',
            'order_index' => 2,
            'content' => "# Designing Your Floor Plan\n\nOur interactive floor plan designer allows you to mirror your physical restaurant layout exactly. Group tables into sections and assign server zones for better service flow.",
            'is_published' => true,
        ]);

        SaaSDocumentation::create([
            'title' => 'Account Management & Deletion',
            'slug' => 'account-management-deletion',
            'category' => 'Account Settings',
            'order_index' => 3,
            'content' => "# Managing Your Account\n\nYou can manage your name, email, and security settings in the **Account Settings** view.\n\n### Updating Your Email\n- **Super Admins**: Updating your email requires a verification code sent to the new address to ensure security.\n- **Tenant Users**: Once your email is verified, it becomes locked for security. Contact your administrator if you need a change.\n\n### Deleting Your Account\nIf you wish to permanently remove your access and data from the Resevit node:\n1. Navigate to **Account Settings**.\n2. Scroll to the bottom of the **Profile Information** tab.\n3. Click **Delete Account**.\n4. Confirm the permanent deletion in the secure modal.\n\n**Warning**: This action is irreversible and will immediately revoke all infrastructure tokens.",
            'is_published' => true,
        ]);

        // Seed Help Articles
        SaaSHelpArticle::create([
            'title' => 'How do I change my opening hours?',
            'slug' => 'change-opening-hours',
            'category' => 'Account Settings',
            'excerpt' => 'Quick steps to update your schedule for holidays or seasonal changes.',
            'content' => "Update your hours easily in the Settings panel: \n\n1. Log in to the Dashboard\n2. Navigate to **Restaurant Profile**\n3. Click **Hours of Operation**\n4. Update your slots and click **Save Changes**.",
            'is_published' => true,
        ]);

        SaaSHelpArticle::create([
            'title' => 'Managing Special Requests',
            'slug' => 'managing-special-requests',
            'category' => 'Reservations',
            'excerpt' => 'How to track allergies, birthdays, and VIP notes for every guest.',
            'content' => "Resevit allows you to attach 'Tags' to reservations. You can see these icons directly on the floor plan to ensure your team is aware of dietary restrictions or special occasions.",
            'is_published' => true,
        ]);
    }
}
