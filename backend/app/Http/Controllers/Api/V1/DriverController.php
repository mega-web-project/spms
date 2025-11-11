<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DriverController extends Controller
{
    /**
     * List all drivers.
     */
  public function index()
{
    $drivers = Driver::with('vehicles')->latest()->get();

    return response()->json([
        'status' => true,
        'data' => $drivers
    ]);
}


    /**
     * Store a newly registered driver.
     */
public function store(Request $request)
{
    try {
        // ✅ Validate input
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:drivers,phone',
            'license_number' => 'required|string|max:255|unique:drivers,license_number',
            'vehicle_number' => 'nullable|string|max:50',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        $validated['created_by'] = auth()->id() ?? 1;

        // ✅ Handle photo file upload
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('uploads/drivers', 'public');
            $validated['photo'] = $path;
        }

        // ✅ Create driver
        $driver = Driver::create($validated);

        // ✅ Update vehicle's drivers JSON
        $vehicle = Vehicle::find($validated['vehicle_id']);
        if ($vehicle) {
            $currentDrivers = $vehicle->drivers ?? []; // get existing drivers or empty array

            // Add new driver info
            $currentDrivers[] = [
                'id' => $driver->id,
                'name' => $driver->full_name,
                'phone' => $driver->phone,
                'license_number' => $driver->license_number,
                'vehicle_number' => $driver->vehicle_number ?? $vehicle->plate_number,
            ];

            // Save updated JSON back to vehicle
            $vehicle->drivers = $currentDrivers;
            $vehicle->save();
        }

        return response()->json([
            'status' => true,
            'message' => 'Driver registered successfully',
            'data' => $driver,
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Error: ' . $e->getMessage(),
        ], 500);
    }
}






    /**
     * Display a single driver.
     */
    public function show(Driver $driver)
    {
        return response()->json([
            'status' => true,
            'data' => $driver
        ]);
    }

    /**
     * Update driver information.
     */
    public function update(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'license_number' => 'sometimes|required|string|max:255|unique:drivers,license_number,' . $driver->id,
            'phone' => 'sometimes|required|string|max:20',
            'vehicle_number' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if ($request->hasFile('photo')) {
            // delete old photo
            if ($driver->photo && Storage::disk('public')->exists($driver->photo)) {
                Storage::disk('public')->delete($driver->photo);
            }

            $path = $request->file('photo')->store('drivers', 'public');
            $validated['photo'] = $path;
        }

        $driver->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Driver updated successfully',
            'data' => $driver
        ]);
    }

    /**
     * Remove a driver.
     */
    public function destroy(Driver $driver)
    {
        if ($driver->photo && Storage::disk('public')->exists($driver->photo)) {
            Storage::disk('public')->delete($driver->photo);
        }

        $driver->delete();

        return response()->json([
            'status' => true,
            'message' => 'Driver deleted successfully'
        ]);
    }
}
