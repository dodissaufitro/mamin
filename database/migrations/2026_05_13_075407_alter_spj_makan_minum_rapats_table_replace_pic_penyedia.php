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
        // Columns and foreign keys already exist from a previous migration attempt.
        // This migration is intentionally left blank to avoid duplicate errors.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->dropForeign(['pic_id']);
            $table->dropForeign(['penyedia_id']);
            $table->dropColumn(['pic_id', 'penyedia_id']);
            $table->string('pic_penanggung_jawab')->nullable();
            $table->string('penyedia')->nullable();
        });
    }
};
