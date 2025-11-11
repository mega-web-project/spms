<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate_number',
        'model',
        'color',
        'images',
        'user_id',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    /**
     * Relationship: A vehicle can have multiple drivers.
     */
    public function drivers()
    {
        return $this->hasMany(Driver::class, 'vehicle_number', 'plate_number');
    }



}
