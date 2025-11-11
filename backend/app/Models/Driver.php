<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'license_number',
        'phone',
        'vehicle_number',
        'company',
        'photo',
        'status',
        'created_by',
         'vehicle_id',
    ];

    /**
     * The user who registered the driver.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'plate_number', 'vehicle_number');
    }
}
