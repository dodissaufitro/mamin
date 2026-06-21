<?php

namespace App\Notifications;

use App\Models\SpjMakanMinumRapat;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewSpjSubmitted extends Notification
{
    use Queueable;

    public function __construct(
        public SpjMakanMinumRapat $spj,
        public ?User $submittedBy = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->spj->loadMissing('pic', 'penyedia', 'itemHps');

        $kegiatan = $this->spj->kegiatan ?: 'Tanpa nama kegiatan';
        $submitter = $this->submittedBy?->name ?? 'PIC';

        return [
            'type' => 'new_spj',
            'spj_id' => $this->spj->id,
            'kegiatan' => $kegiatan,
            'item_hps' => $this->spj->itemHps?->nama_item,
            'pic' => $this->spj->pic?->nama,
            'penyedia' => $this->spj->penyedia?->nama,
            'submitted_by' => $submitter,
            'message' => "SPJ baru dari {$submitter}: {$kegiatan}",
        ];
    }
}
