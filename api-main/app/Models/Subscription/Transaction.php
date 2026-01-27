<?php

namespace App\Models\Subscription;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'external_id',
        'amount',
        'currency',
        'type',
        'metadata',
        'status',
    ];

    protected $casts = [
        'metadata' => 'json',
    ];
}
