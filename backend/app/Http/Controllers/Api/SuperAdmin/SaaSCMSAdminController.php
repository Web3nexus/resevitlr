<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SaaSBlog;
use App\Models\SaaSCustomerStory;
use App\Models\SaaSDocumentation;

class SaaSCMSAdminController extends Controller
{
    // --- BLOGS ---
    public function blogs() {
        return response()->json(SaaSBlog::orderBy('created_at', 'desc')->get());
    }

    public function storeBlog(Request $request) {
        $data = $request->validate([
            'title' => 'required|string',
            'slug' => 'required|string|unique:saa_s_blogs,slug',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'author' => 'nullable|string',
            'image_url' => 'nullable|string',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);
        $blog = SaaSBlog::create($data);
        return response()->json($blog, 201);
    }

    public function updateBlog(Request $request, $id) {
        $blog = SaaSBlog::findOrFail($id);
        $data = $request->validate([
            'title' => 'string',
            'slug' => 'string|unique:saa_s_blogs,slug,' . $id,
            'excerpt' => 'nullable|string',
            'content' => 'string',
            'author' => 'nullable|string',
            'image_url' => 'nullable|string',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);
        $blog->update($data);
        return response()->json($blog);
    }

    public function destroyBlog($id) {
        SaaSBlog::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // --- CUSTOMER STORIES ---
    public function stories() {
        return response()->json(SaaSCustomerStory::orderBy('created_at', 'desc')->get());
    }

    public function storeStory(Request $request) {
        $data = $request->validate([
            'client_name' => 'required|string',
            'slug' => 'required|string|unique:saa_s_customer_stories,slug',
            'logo_url' => 'nullable|string',
            'metrics' => 'nullable|array',
            'content' => 'required|string',
            'is_published' => 'boolean',
        ]);
        $story = SaaSCustomerStory::create($data);
        return response()->json($story, 201);
    }

    public function updateStory(Request $request, $id) {
        $story = SaaSCustomerStory::findOrFail($id);
        $data = $request->validate([
            'client_name' => 'string',
            'slug' => 'string|unique:saa_s_customer_stories,slug,' . $id,
            'logo_url' => 'nullable|string',
            'metrics' => 'nullable|array',
            'content' => 'string',
            'is_published' => 'boolean',
        ]);
        $story->update($data);
        return response()->json($story);
    }

    public function destroyStory($id) {
        SaaSCustomerStory::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // --- DOCUMENTATION ---
    public function docs() {
        return response()->json(SaaSDocumentation::orderBy('order_index')->get());
    }

    public function storeDoc(Request $request) {
        $data = $request->validate([
            'title' => 'required|string',
            'slug' => 'required|string|unique:saa_s_documentations,slug',
            'category' => 'required|string',
            'order_index' => 'integer',
            'content' => 'required|string',
            'is_published' => 'boolean',
        ]);
        $doc = SaaSDocumentation::create($data);
        return response()->json($doc, 201);
    }

    public function updateDoc(Request $request, $id) {
        $doc = SaaSDocumentation::findOrFail($id);
        $data = $request->validate([
            'title' => 'string',
            'slug' => 'string|unique:saa_s_documentations,slug,' . $id,
            'category' => 'string',
            'order_index' => 'integer',
            'content' => 'string',
            'is_published' => 'boolean',
        ]);
        $doc->update($data);
        return response()->json($doc);
    }

    public function destroyDoc($id) {
        SaaSDocumentation::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
