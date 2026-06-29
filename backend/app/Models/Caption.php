<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Caption extends Model
{
    protected $fillable = [
        'project_id',
        'order',
        'text',
        'start',
        'end',
    ];

    protected $casts = [
        'start' => 'float',
        'end'   => 'float',
        'order' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function words(): HasMany
    {
        return $this->hasMany(Word::class)->orderBy('start');
    }
}