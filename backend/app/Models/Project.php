<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'name',
        'video_path',
        'video_name',
        'thumbnail_path',
        'duration',
        'language',
        'status',
    ];

    protected $casts = [
        'duration' => 'integer',
    ];

    public function captions(): HasMany
    {
        return $this->hasMany(Caption::class)->orderBy('order');
    }

    public function exports(): HasMany
    {
        return $this->hasMany(Export::class);
    }
}