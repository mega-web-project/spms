<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'id_number',
        'phone',
        'company',
        'photo',
        'user_id',
    ];

    // Each visitor was registered by a user (security officer)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
