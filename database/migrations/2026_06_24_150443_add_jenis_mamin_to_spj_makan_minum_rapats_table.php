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
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->string('jenis_mamin')->default('snack dan makanan')->after('kegiatan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->dropColumn('jenis_mamin');
        });
    }
};
