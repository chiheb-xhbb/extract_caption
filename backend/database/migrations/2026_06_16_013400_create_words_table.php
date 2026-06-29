<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('words', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('caption_id');
            $table->foreign('caption_id')
                  ->references('id')
                  ->on('captions')
                  ->onDelete('cascade');
            $table->string('word');
            $table->float('start');
            $table->float('end');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('words');
    }
};