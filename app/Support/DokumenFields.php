<?php

namespace App\Support;

class DokumenFields
{
    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return [
            'surat_undangan',
            'memo',
            'invoice',
            'kwitansi',
            'nib',
            'absen',
            'notulen',
            'dokumentasi',
        ];
    }

    public static function aktifColumn(string $key): string
    {
        return "{$key}_aktif";
    }

    /**
     * @return list<string>
     */
    public static function aktifColumns(): array
    {
        return array_map(fn (string $key) => self::aktifColumn($key), self::keys());
    }

    /**
     * @return list<string>
     */
    public static function defaultAktifFor(?string $namaItem): array
    {
        if ($namaItem && str_contains(strtolower($namaItem), 'galon')) {
            return ['nib', 'invoice', 'kwitansi', 'memo'];
        }

        return self::keys();
    }

    /**
     * @return list<string>
     */
    public static function activeKeysFrom(array $attributes): array
    {
        return array_values(array_filter(
            self::keys(),
            fn (string $key) => ! empty($attributes[self::aktifColumn($key)]),
        ));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public static function isComplete(array $attributes): bool
    {
        $activeKeys = self::activeKeysFrom($attributes);

        if ($activeKeys === []) {
            return false;
        }

        foreach ($activeKeys as $key) {
            if (empty($attributes[$key])) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array<string, string>
     */
    public static function rules(bool $includeAktif = true, bool $includeCompletion = true): array
    {
        $rules = [];

        if ($includeCompletion) {
            foreach (self::keys() as $key) {
                $rules[$key] = 'boolean';
            }
            $rules['kelengkapan_dokumen'] = 'boolean';
        }

        if ($includeAktif) {
            foreach (self::keys() as $key) {
                $rules[self::aktifColumn($key)] = 'boolean';
            }
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function withKelengkapan(array $data): array
    {
        $data['kelengkapan_dokumen'] = self::isComplete($data);

        return $data;
    }
}
