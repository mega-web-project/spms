<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Checkpoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'description',
        'created_by',
    ];

    /**
     * The user who created the checkpoint.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check-ins related to this checkpoint.
     */
    public function checkIns()
    {
        return $this->hasMany(CheckInOut::class, 'checkpoint_id');
    }
}
