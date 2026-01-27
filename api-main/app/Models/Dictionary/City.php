<?php

namespace App\Models\Dictionary;

use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property Point $location
 */
class City extends Model
{
    public $timestamps = false;
    protected $table = 'cities';
    protected $fillable = [
        'name',
        'ru_name',
        'country_code',
        'location',
        'timezone'
    ];

    protected $casts = [
        'location' => Point::class,
    ];

    protected $appends = [
        'en_name',
        'ru_country_name',
        'en_country_name',
    ];

    public function getEnNameAttribute(): string|null
    {
        return $this->name ?? null;
    }

    public function getRuCountryNameAttribute(): string|null
    {
        /** @var Country $country */
        $country = DB::table('countries')
            ->where('country_code', $this->country_code)
            ->first();

        if ($country === null) {
            return null;
        }

        return $country->ru_name ?? null;
    }

    public function getEnCountryNameAttribute(): string|null
    {
        /** @var Country $country */
        $country = DB::table('countries')
            ->where('country_code', $this->country_code)
            ->first();

        return $country?->name;
    }
}
