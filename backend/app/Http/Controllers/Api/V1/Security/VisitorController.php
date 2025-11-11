<?php

namespace App\Http\Controllers\Api\V1\Security;


use App\Http\Controllers\Controller;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class VisitorController extends Controller
{
    /**
     * List all visitors
     */
public function index()
{
    $visitors = Visitor::select('id', 'name', 'id_number', 'phone', 'company', 'photo')
        ->latest()
        ->get()
        ->map(function ($visitor) {
            // Add full URL for photo if it exists
            if ($visitor->photo) {
                $visitor->photo = asset('storage/' . $visitor->photo);
            }
            return $visitor;
        });

    return response()->json($visitors);
}


    /**
     * Store a new visitor
     */
   public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'id_number' => 'required|string|max:255|unique:visitors,id_number',
        'phone' => 'required|string|max:20',
        'company' => 'nullable|string|max:255',
        'photo' => 'nullable|string', // base64 string
    ]);

    // Handle base64 image upload
    if (!empty($validated['photo'])) {
        $image = $validated['photo'];

        // Check if it's a valid base64 string
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, jpeg etc.

            if (!in_array($type, ['jpg', 'jpeg', 'png'])) {
                return response()->json(['error' => 'Invalid image type'], 422);
            }

            $image = str_replace(' ', '+', $image);
            $imageData = base64_decode($image);

            if ($imageData === false) {
                return response()->json(['error' => 'Base64 decode failed'], 422);
            }

            // Generate unique filename
            $fileName = 'visitors/' . uniqid() . '.' . $type;
            Storage::disk('public')->put($fileName, $imageData);

            $validated['photo'] = $fileName;
        } else {
            return response()->json(['error' => 'Invalid image format'], 422);
        }
    }

    $validated['user_id'] = Auth::id();
    $visitor = Visitor::create($validated);

    // Return photo with full URL
    if ($visitor->photo) {
        $visitor->photo = asset('storage/' . $visitor->photo);
    }

    return response()->json([
        'message' => 'Visitor registered successfully',
        'visitor' => $visitor,
    ], 201);
}


    /**
     * Update visitor details
     */
    public function update(Request $request, Visitor $visitor)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'id_number' => 'required|string|max:255|unique:visitors,id_number,' . $visitor->id,
        'phone' => 'required|string|max:20',
        'company' => 'nullable|string|max:255',
        'photo' => 'nullable|string', // now accepts base64
    ]);

    // Handle base64 image update
    if (!empty($validated['photo'])) {
        $image = $validated['photo'];

        // Check if it's a valid base64 string
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]);

            if (!in_array($type, ['jpg', 'jpeg', 'png'])) {
                return response()->json(['error' => 'Invalid image type'], 422);
            }

            $image = str_replace(' ', '+', $image);
            $imageData = base64_decode($image);

            if ($imageData === false) {
                return response()->json(['error' => 'Base64 decode failed'], 422);
            }

            // Delete old photo if exists
            if ($visitor->photo && Storage::disk('public')->exists($visitor->photo)) {
                Storage::disk('public')->delete($visitor->photo);
            }

            // Save new photo
            $fileName = 'visitors/' . uniqid() . '.' . $type;
            Storage::disk('public')->put($fileName, $imageData);
            $validated['photo'] = $fileName;
        } else {
            // If not base64, ignore so we don't accidentally overwrite photo field
            unset($validated['photo']);
        }
    } else {
        unset($validated['photo']); // prevent null overwriting
    }

    $visitor->update($validated);

    // Include full photo URL in response
    if ($visitor->photo) {
        $visitor->photo = asset('storage/' . $visitor->photo);
    }

    return response()->json([
        'message' => 'Visitor updated successfully',
        'visitor' => $visitor,
    ]);
}


    /**
     * Delete visitor record
     */
    public function destroy(Visitor $visitor)
    {
        if ($visitor->photo && Storage::disk('public')->exists($visitor->photo)) {
            Storage::disk('public')->delete($visitor->photo);
        }

        $visitor->delete();

        return response()->json(['message' => 'Visitor deleted successfully']);
    }
}
