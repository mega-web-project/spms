<?php

namespace App\Http\Controllers\Api\V1\Security;

use App\Http\Controllers\Controller;
use App\Models\Checkpoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckpointController extends Controller
{
    /**
     * List all checkpoints
     */
    public function index()
    {
        $checkpoints = Checkpoint::with('creator')->orderByDesc('created_at')->get();

        return response()->json([
            'status' => true,
            'data' => $checkpoints,
        ]);
    }

    /**
     * Create a new checkpoint
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $checkpoint = Checkpoint::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Checkpoint created successfully.',
            'data' => $checkpoint,
        ], 201);
    }

    /**
     * Show a specific checkpoint
     */
    public function show(Checkpoint $checkpoint)
    {
        return response()->json([
            'status' => true,
            'data' => $checkpoint->load('creator'),
        ]);
    }

    /**
     * Update a checkpoint
     */
    public function update(Request $request, Checkpoint $checkpoint)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $checkpoint->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Checkpoint updated successfully.',
            'data' => $checkpoint,
        ]);
    }

    /**
     * Delete a checkpoint
     */
    public function destroy(Checkpoint $checkpoint)
    {
        $checkpoint->delete();

        return response()->json([
            'status' => true,
            'message' => 'Checkpoint deleted successfully.',
        ]);
    }
}
