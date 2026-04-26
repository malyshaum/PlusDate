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
        'latitude',
        'longitude',
        'location',
        'timezone'
    ];

    protected $appends = [
        'en_name',
        'ru_country_name',
        'en_country_name',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->casts['location'] = config('database.use_postgis') ? Point::class : 'array';
    }

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

    public function getLatitudeValue(): ?float
    {
        if (config('database.use_postgis') && $this->location instanceof Point) {
            return $this->location->getLatitude();
        }

        if (is_array($this->location)) {
            return isset($this->location['latitude']) ? (float)$this->location['latitude'] : null;
        }

        return $this->latitude !== null ? (float)$this->latitude : null;
    }

    public function getLongitudeValue(): ?float
    {
        if (config('database.use_postgis') && $this->location instanceof Point) {
            return $this->location->getLongitude();
        }

        if (is_array($this->location)) {
            return isset($this->location['longitude']) ? (float)$this->location['longitude'] : null;
        }

        return $this->longitude !== null ? (float)$this->longitude : null;
    }

    public function getLocationPayload(): ?array
    {
        $latitude = $this->getLatitudeValue();
        $longitude = $this->getLongitudeValue();

        if ($latitude === null || $longitude === null) {
            return null;
        }

        return [
            'latitude' => $latitude,
            'longitude' => $longitude,
        ];
    }
}
