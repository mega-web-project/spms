<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckInOut extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'item_id',
        'item_names',
        'checkpoint_name',
        'checkpoint_id',
        'shift',
        'purpose',
        'checked_in_by',
        'checked_in_at',
        'checked_out_by',
        'checked_out_at',
        'status',
    ];

    protected $casts = [
        'item_id' => 'array',
        'item_names' => 'array',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    /** Relationships **/
    public function checkpoint()
    {
        return $this->belongsTo(Checkpoint::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'item_id');
    }

    public function visitor()
    {
        return $this->belongsTo(Visitor::class, 'item_id');
    }

    public function checkedInBy()
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function checkedOutBy()
    {
        return $this->belongsTo(User::class, 'checked_out_by');
    }
}
