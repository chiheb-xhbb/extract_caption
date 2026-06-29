<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Word extends Model
{
    protected $fillable = [
        'caption_id',
        'word',
        'start',
        'end',
    ];

    protected $casts = [
        'start' => 'float',
        'end'   => 'float',
    ];

    public function caption(): BelongsTo
    {
        return $this->belongsTo(Caption::class);
    }
}