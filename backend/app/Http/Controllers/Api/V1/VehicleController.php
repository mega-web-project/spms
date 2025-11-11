<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VehicleController extends Controller
{
    /**
     * Display all vehicles.
     */
/**
 * Display all vehicles with drivers and full image URLs.
 */
public function index()
{
    $vehicles = Vehicle::latest()
        ->get()
        ->map(function ($vehicle) {
            // Images
            $images = [];
            if (is_array($vehicle->images)) {
                $images = collect($vehicle->images)->map(fn($img) =>
                    str_contains($img, 'http') ? $img : asset('storage/' . ltrim($img, '/'))
                )->toArray();
            } elseif (!empty($vehicle->image)) {
                $images[] = asset('storage/' . ltrim($vehicle->image, '/'));
            }

            // Decode drivers JSON
            $drivers = collect(json_decode($vehicle->drivers ?? '[]', true))->map(function ($driver) {
                return [
                    'id' => $driver['id'],
                    'name' => $driver['name'],
                    'phone' => $driver['phone'] ?? null,
                    'vehicle_number' => $driver['vehicle_number'],
                ];
            });

            return [
                'id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'model' => $vehicle->model,
                'color' => $vehicle->color,
                'images' => $images,
                'drivers' => $drivers,
                'user_id' => $vehicle->user_id,
                'created_at' => $vehicle->created_at,
                'updated_at' => $vehicle->updated_at,
            ];
        });

    return response()->json([
        'status' => 'success',
        'data' => $vehicles,
    ]);
}





    /**
     * Store a newly created vehicle.
     */


public function store(Request $request)
{
    $validated = $request->validate([
        'plate_number' => 'required|string|unique:vehicles,plate_number',
        'model' => 'required|string',
        'color' => 'required|string',
        'drivers' => 'nullable|array',
        'user_id' => 'nullable|exists:users,id',
        'images' => 'nullable|array',
        'images.*' => 'string', // base64 strings
    ]);

    $storedImages = [];

    // ✅ Handle Base64 multiple image uploads
    if ($request->images && is_array($request->images)) {
        foreach ($request->images as $base64Image) {
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $imageData = substr($base64Image, strpos($base64Image, ',') + 1);
                $imageData = base64_decode($imageData);

                $extension = strtolower($type[1]); // jpg, png, jpeg, etc.
                $fileName = 'vehicles/' . Str::random(10) . '.' . $extension;

                Storage::disk('public')->put($fileName, $imageData);
                $storedImages[] = $fileName;
            }
        }

        $validated['images'] = $storedImages;
    }

    // ✅ Handle single file upload (optional)
    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')->store('vehicles', 'public');
    }

    $vehicle = Vehicle::create($validated);

    return response()->json([
        'message' => 'Vehicle registered successfully',
        'vehicle' => $vehicle,
    ], 201);
}


    /**
     * Update an existing vehicle.
     */
public function update(Request $request, $id)
{
    $vehicle = Vehicle::find($id);
    if (!$vehicle) {
        return response()->json(['message' => 'Vehicle not found'], 404);
    }

    $validated = $request->validate([
        'plate_number' => 'sometimes|string|unique:vehicles,plate_number,' . $vehicle->id,
        'model' => 'sometimes|string',
        'color' => 'sometimes|string',
        'images' => 'nullable|array', // multiple images
        'images.*' => 'nullable|string', // base64 strings
        'drivers' => 'nullable|array',
    ]);

    $storedImages = [];

    // ✅ Handle Base64 multiple image uploads
    if ($request->images && is_array($request->images)) {
        foreach ($request->images as $base64Image) {
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $imageData = substr($base64Image, strpos($base64Image, ',') + 1);
                $imageData = base64_decode($imageData);

                $extension = strtolower($type[1]); // jpg, png, jpeg, etc.
                $fileName = 'vehicles/' . Str::random(10) . '.' . $extension;

                Storage::disk('public')->put($fileName, $imageData);
                $storedImages[] = $fileName;
            }
        }

        // delete old images if stored in DB and exist
        if ($vehicle->images && is_array($vehicle->images)) {
            foreach ($vehicle->images as $oldImage) {
                if (Storage::disk('public')->exists($oldImage)) {
                    Storage::disk('public')->delete($oldImage);
                }
            }
        }

        $validated['images'] = $storedImages;
    }

    // ✅ Handle single traditional file upload (optional)
    if ($request->hasFile('image')) {
        // delete old single image if exists
        if ($vehicle->image && Storage::disk('public')->exists($vehicle->image)) {
            Storage::disk('public')->delete($vehicle->image);
        }
        $validated['image'] = $request->file('image')->store('vehicles', 'public');
    }

    $vehicle->update($validated);

    return response()->json([
        'message' => 'Vehicle updated successfully',
        'vehicle' => $vehicle,
    ]);
}



    /**
     * Delete a vehicle.
     */
    public function destroy($id)
    {
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return response()->json(['message' => 'Vehicle not found'], 404);
        }

        if ($vehicle->image && Storage::disk('public')->exists($vehicle->image)) {
            Storage::disk('public')->delete($vehicle->image);
        }

        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted successfully']);
    }
}
