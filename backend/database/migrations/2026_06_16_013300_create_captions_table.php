<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('captions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->integer('order');
            $table->text('text');
            $table->float('start');
            $table->float('end');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('captions');
    }
};