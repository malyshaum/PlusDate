<?php

namespace App\Models\Dictionary;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    public $timestamps = false;
    protected $table = 'countries';
    protected $fillable = [
        'name',
        'ru_name',
        'country_code',
        'latitude',
        'longitude',
        'timezone'
    ];

    protected $appends = [
        'en_name'
    ];

    public function getEnNameAttribute(): string|null
    {
        return $this->name;
    }
}
