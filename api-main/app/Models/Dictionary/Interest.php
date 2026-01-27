<?php

namespace App\Models\Dictionary;

use Illuminate\Database\Eloquent\Model;

class Interest extends Model
{
    protected $connection = "dictionary";

    public $fillable = [
        "name"
    ];
}
