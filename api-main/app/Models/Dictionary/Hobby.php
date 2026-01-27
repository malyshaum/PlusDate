<?php

namespace App\Models\Dictionary;

use Illuminate\Database\Eloquent\Model;

class Hobby extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'emoji'
    ];
}
