<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use App\Models\SpjMakanMinumRapat;

class NewSpjSubmitted extends Notification
{
    use Queueable;

    public $spj;

    /**
     * Create a new notification instance.
     */
    public function __construct(SpjMakanMinumRapat $spj)
    {
        $this->spj = $spj;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'spj_id' => $this->spj->id,
            'kegiatan' => $this->spj->kegiatan,
            'message' => 'New SPJ submitted: ' . $this->spj->kegiatan,
        ];
    }
}
