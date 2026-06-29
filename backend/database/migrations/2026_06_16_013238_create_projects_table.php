<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {

            $table->id();

            $table->string('name');

            $table->string('video_name')->nullable();

            $table->string('video_path')->nullable();

            $table->decimal('duration', 10, 3)->default(0);

            $table->string('language')->nullable();

            $table->string('whisper_model')->nullable();

            $table->enum('status', [
                'pending',
                'processing',
                'completed',
                'error'
            ])->default('pending');

            $table->text('error_message')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};