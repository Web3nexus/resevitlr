<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SystemMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $subjectStr;
    public $contentHtml;

    public function __construct(string $subject, string $content, array $variables = [])
    {
        $this->subjectStr = $this->replaceVariables($subject, $variables);
        $this->contentHtml = $this->replaceVariables($content, $variables);
    }

    private function replaceVariables(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $text = str_replace('{' . $key . '}', $value, $text);
        }
        return $text;
    }

    public function envelope(): Envelope
    {
        $fromAddress = \App\Models\SaaSSetting::get('from_address') ?? 'noreply@resevit.com';
        $platformName = \App\Models\SaaSSetting::get('platform_name') ?? 'Resevit';

        return new Envelope(
            from: new Address($fromAddress, $platformName),
            subject: $this->subjectStr,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->contentHtml,
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
