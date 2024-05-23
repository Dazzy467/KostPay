<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detail_kamar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idKamar')->constrained('kamar');
            $table->foreignId('idPenyewa')->constrained('penyewa');
            $table->date('TanggalSewa')->nullable();
            $table->date('TanggalJatuhTempo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_kamar');
    }
};
