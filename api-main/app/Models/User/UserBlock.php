<?php

declare(strict_types=1);

namespace App\Models\User;

use Illuminate\Database\Eloquent\Model;

class UserBlock extends Model
{
    protected $table = 'user_blocks';

    protected $fillable = [
        'user_id',
        'blocked_user_id',
    ];
}
