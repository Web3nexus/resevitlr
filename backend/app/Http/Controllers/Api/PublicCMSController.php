<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SaaSBlog;
use App\Models\SaaSCustomerStory;
use App\Models\SaaSDocumentation;
use App\Models\SaaSHelpArticle;
use Illuminate\Http\Request;

class PublicCMSController extends Controller
{
    public function getBlogs()
    {
        $blogs = SaaSBlog::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json($blogs);
    }

    public function getBlog($slug)
    {
        $blog = SaaSBlog::where('is_published', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($blog);
    }

    public function getCustomerStories()
    {
        $stories = SaaSCustomerStory::where('is_published', true)
            ->latest()
            ->get();

        return response()->json($stories);
    }

    public function getCustomerStory($slug)
    {
        $story = SaaSCustomerStory::where('is_published', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($story);
    }

    public function getDocs()
    {
        $docs = SaaSDocumentation::where('is_published', true)
            ->orderBy('order_index')
            ->get();
        return response()->json($docs);
    }

    public function getHelp()
    {
        $articles = SaaSHelpArticle::where('is_published', true)
            ->orderBy('category')
            ->get();
        return response()->json($articles);
    }
}
