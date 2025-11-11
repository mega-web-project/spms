<?php

namespace App\Http\Controllers\Api\V1\Security;

use App\Http\Controllers\Controller;
use App\Models\CheckInOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckInOutController extends Controller
{
    /**
     * List all check-ins (vehicles & visitors)
     */
public function index(Request $request)
{
    $query = CheckInOut::with(['checkpoint', 'checkedInBy', 'checkedOutBy'])
        ->orderByDesc('created_at');

    if ($request->filled('type')) {
        $query->where('type', $request->type);
    }

    if ($request->filled('status')) {
        $query->where('status', $request->status);
    }

    $checkIns = $query->get()->map(function ($record) {
        // Decode arrays
        $record->item_id = is_string($record->item_id) ? json_decode($record->item_id, true) : $record->item_id;
        $record->item_names = is_string($record->item_names) ? json_decode($record->item_names, true) : $record->item_names;

        // 🧍 Visitors
        if ($record->type === 'visitor') {
            $record->visitors = \App\Models\Visitor::whereIn('id', (array) $record->item_id)
                ->get(['id', 'name', 'photo'])
                ->map(function ($v) {
                    $v->photo = $v->photo ? asset('storage/' . $v->photo) : null;
                    return $v;
                });
        }

        // 🚗 Vehicles
        if ($record->type === 'vehicle') {
            $record->vehicles = \App\Models\Vehicle::whereIn('id', (array) $record->item_id)
                ->get(['id', 'plate_number', 'images'])
                ->map(function ($v) {
                    // Get first image from the JSON array
                    $firstImage = is_array($v->images) && count($v->images) > 0
                        ? asset('storage/' . $v->images[0])
                        : null;

                    // Attach it as 'photo' for frontend use
                    $v->photo = $firstImage;

                    return $v;
                });
        }

        $record->checkpoint_name = $record->checkpoint->name ?? 'Unknown';

        return $record;
    });

    return response()->json([
        'status' => true,
        'data' => $checkIns,
    ]);
}





    /**
     * Handle Vehicle or Visitor Check-In
     */
public function checkIn(Request $request)
{
    $validated = $request->validate([
        'type' => 'required|in:vehicle,visitor',
        'item_id' => 'required|array', // ✅ Now accepts array of IDs
        'item_id.*' => 'integer',      // ✅ Each item must be integer
        'item_names' => 'nullable|array',
        'checkpoint_id' => 'required|integer|exists:checkpoints,id',
        'shift' => 'required|string|max:50',
        'purpose' => 'nullable|string|max:255',
    ]);

    // ✅ Prevent duplicate active check-ins for any of these item IDs
    $existing = CheckInOut::where('type', $validated['type'])
        ->whereJsonContains('item_id', $validated['item_id'])
        ->where('status', 'checked-in')
        ->first();

    if ($existing) {
        return response()->json([
            'status' => false,
            'message' => ucfirst($validated['type']) . ' already checked in.',
        ], 409);
    }

    // ✅ Create check-in with array values stored as JSON
    $checkIn = CheckInOut::create([
        'type' => $validated['type'],
        'item_id' => json_encode($validated['item_id']),
        'item_names' => $validated['item_names'] ?? [],
        'checkpoint_id' => $validated['checkpoint_id'],
        'shift' => $validated['shift'],
        'purpose' => $validated['purpose'] ?? null,
        'checked_in_by' => auth()->id(),
        'checked_in_at' => now(),
        'status' => 'checked-in',
    ]);

    return response()->json([
        'status' => true,
        'message' => ucfirst($validated['type']) . ' successfully checked in.',
        'data' => $checkIn,
    ], 201);
}


    /**
     * Handle Check-Out for Vehicle or Visitor
     */
    public function checkOut(Request $request, $id)
    {
        $checkIn = CheckInOut::find($id);

        if (!$checkIn) {
            return response()->json([
                'status' => false,
                'message' => 'Check-in record not found.',
            ], 404);
        }

        if ($checkIn->status === 'checked-out') {
            return response()->json([
                'status' => false,
                'message' => ucfirst($checkIn->type) . ' already checked out.',
            ], 409);
        }

        $checkIn->update([
            'checked_out_by' => Auth::id(),
            'checked_out_at' => now(),
            'status' => 'checked-out',
        ]);

        return response()->json([
            'status' => true,
            'message' => ucfirst($checkIn->type) . ' successfully checked out.',
            'data' => $checkIn,
        ]);
    }

    /**
     * Show single record details
     */
    public function show($id)
    {
        $record = CheckInOut::with(['checkpoint', 'vehicle', 'visitor', 'checkedInBy', 'checkedOutBy'])
            ->find($id);

        if (!$record) {
            return response()->json([
                'status' => false,
                'message' => 'Record not found.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $record,
        ]);
    }

    /**
     * Delete a record (optional for admin)
     */
    public function destroy($id)
    {
        $record = CheckInOut::find($id);

        if (!$record) {
            return response()->json([
                'status' => false,
                'message' => 'Record not found.',
            ], 404);
        }

        $record->delete();

        return response()->json([
            'status' => true,
            'message' => 'Record deleted successfully.',
        ]);
    }
}
