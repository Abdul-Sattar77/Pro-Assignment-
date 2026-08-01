<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Notifies the studio inbox that a new landing-page enquiry arrived. The
 * visitor's address is set as reply-to so a rep can answer with one click.
 */
final class InquiryReceived extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly Inquiry $inquiry) {}

    public function envelope(): Envelope
    {
        $subject = $this->inquiry->subject
            ? "Website enquiry: {$this->inquiry->subject}"
            : 'New website enquiry';

        return new Envelope(
            subject: $subject,
            replyTo: [$this->inquiry->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $i = $this->inquiry;
        $rows = [
            'Name' => $i->name,
            'Email' => $i->email,
            'Phone' => $i->phone ?: '—',
            'Subject' => $i->subject ?: '—',
        ];

        $html = '<h2>New website enquiry</h2><table cellpadding="6" style="border-collapse:collapse">';
        foreach ($rows as $label => $value) {
            $html .= '<tr><td style="color:#64748b"><strong>'.e($label).'</strong></td><td>'.e($value).'</td></tr>';
        }
        $html .= '</table><hr><p style="white-space:pre-wrap">'.e($i->message).'</p>';

        return $html;
    }
}
