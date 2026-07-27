<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\EmailDirection;
use App\Enums\EmailMessageStatus;
use App\Enums\Role;
use App\Enums\WhatsAppDirection;
use App\Enums\WhatsAppMessageStatus;
use App\Enums\WhatsAppMessageType;
use App\Models\EmailAttachment;
use App\Models\EmailMessage;
use App\Models\EmailThread;
use App\Models\User;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppMessage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Demo conversations for the WhatsApp and email inboxes.
 *
 * Purely for local demos and client walkthroughs — it seeds nothing the app
 * needs to run. Deliberately covers the awkward states as well as the happy
 * path, so the UI can be reviewed without waiting for them to occur naturally:
 * unassigned threads, an expired WhatsApp service window, a failed send, a
 * message sent from the phone app, and a rep-hidden message.
 *
 *   php artisan db:seed --class=DemoInboxSeeder     # add
 *   php artisan db:seed --class=DemoInboxSeeder --force
 *
 * Re-running replaces the demo rows rather than duplicating them. Remove them
 * all with {@see self::purge()} via `--class=DemoInboxSeeder` after setting
 * DEMO_INBOX_PURGE=1.
 */
final class DemoInboxSeeder extends Seeder
{
    /** Demo WhatsApp numbers, so purge knows exactly what it owns. */
    private const WA_IDS = ['923339876543', '923011122334', '923215558899', '447700900123'];

    /** Demo Gmail thread ids, likewise. */
    private const MAIL_THREADS = ['demo_th_1', 'demo_th_2', 'demo_th_3'];

    public function run(): void
    {
        $this->purge();

        if (env('DEMO_INBOX_PURGE')) {
            $this->command?->info('Demo inbox data removed.');

            return;
        }

        $sales = User::role(Role::Sales->value)->first() ?? User::role(Role::Admin->value)->first();
        $admin = User::role(Role::Admin->value)->first();

        if ($sales === null || $admin === null) {
            $this->command?->warn('Need at least an admin user — run RolePermissionSeeder and create users first.');

            return;
        }

        $this->seedWhatsApp($sales, $admin);
        $this->seedEmail($sales, $admin);

        $this->command?->info('Demo inbox data seeded: 4 WhatsApp chats, 3 email threads.');
    }

    /** Remove every row this seeder owns, including soft-deleted ones. */
    private function purge(): void
    {
        $contactIds = WhatsAppContact::withTrashed()->whereIn('wa_id', self::WA_IDS)->pluck('id');
        WhatsAppMessage::withTrashed()->whereIn('contact_id', $contactIds)->forceDelete();
        WhatsAppContact::withTrashed()->whereIn('id', $contactIds)->forceDelete();

        $threadIds = EmailThread::withTrashed()->whereIn('gmail_thread_id', self::MAIL_THREADS)->pluck('id');
        $messageIds = EmailMessage::withTrashed()->whereIn('thread_id', $threadIds)->pluck('id');
        EmailAttachment::whereIn('message_id', $messageIds)->delete();
        EmailMessage::withTrashed()->whereIn('id', $messageIds)->forceDelete();
        EmailThread::withTrashed()->whereIn('id', $threadIds)->forceDelete();
    }

    private function seedWhatsApp(User $sales, User $admin): void
    {
        // --- 1. Hot lead, unassigned, window open, unread ---
        $ali = $this->contact('923339876543', 'Ali Raza', null, now()->subMinutes(6));
        $this->wa($ali, 'in', 'Assalam o alaikum, do you handle finance assignments?', now()->subMinutes(12));
        $this->wa($ali, 'in', 'I need 2500 words on capital budgeting, deadline is Sunday night.', now()->subMinutes(9));
        $this->wa($ali, 'in', 'Please tell me the price 🙏', now()->subMinutes(6));

        // --- 2. Active conversation, assigned, replies from the portal ---
        $sara = $this->contact('923011122334', 'Sara Khan', $sales, now()->subMinutes(35));
        $this->wa($sara, 'in', 'Hi, I got your number from a friend. Do you do dissertations?', now()->subHours(3));
        $this->wa($sara, 'out', 'Walaikum assalam Sara! Yes we do — what is your subject and word count?', now()->subHours(3)->addMinutes(4), $sales);
        $this->wa($sara, 'in', 'Marketing, 8000 words. Due 20th August.', now()->subHours(2));
        $this->wa($sara, 'out', 'That works. For 8000 words at that deadline it is PKR 24,000, payable 50% upfront. Shall I send the invoice?', now()->subHours(2)->addMinutes(6), $sales);
        $this->wa($sara, 'in', 'Yes please send it. Can I pay via Easypaisa?', now()->subMinutes(35));

        // --- 3. Window CLOSED — shows the amber "reply window closed" state ---
        $bilal = $this->contact('923215558899', 'Bilal Ahmed', $sales, now()->subDays(3));
        $this->wa($bilal, 'in', 'Do you offer proofreading only, without writing?', now()->subDays(3)->subMinutes(20));
        $this->wa($bilal, 'out', 'Yes, proofreading is PKR 2 per word. Send the file whenever you are ready.', now()->subDays(3), $sales);

        // --- 4. Mixed states: phone-app reply, a failure, and a hidden message ---
        $uk = $this->contact('447700900123', 'Hannah Willis', $sales, now()->subMinutes(50));
        $this->wa($uk, 'in', 'Hello, I am a UK student. Do you write to Harvard referencing?', now()->subHours(5));

        // Sent from the WhatsApp Business phone app (Coexistence) — no rep.
        $phone = $this->wa($uk, 'out', 'Hi Hannah, yes we do Harvard, APA and MLA.', now()->subHours(4), null);
        $phone->forceFill(['via_business_app' => true])->save();

        // A send that failed — proves failures stay auditable.
        $failed = $this->wa($uk, 'out', 'Would you like a sample of our previous Harvard work?', now()->subHours(3), $sales);
        $failed->forceFill([
            'status' => WhatsAppMessageStatus::Failed,
            'failed_at' => now()->subHours(3),
            'error_code' => '131047',
            'error_message' => 'Message failed to send because more than 24 hours have passed since the customer last replied.',
        ])->save();

        $this->wa($uk, 'in', 'Yes please send a sample.', now()->subMinutes(50));

        // Hidden by a rep — visible only in the admin Oversight tab.
        $hidden = $this->wa($uk, 'out', 'Ignore my last message, wrong chat — sorry!', now()->subMinutes(45), $sales);
        $hidden->deleted_by = $sales->id;
        $hidden->save();
        $hidden->delete();

        activity('whatsapp_message')
            ->performedOn($hidden)
            ->causedBy($sales)
            ->withProperties(['body' => $hidden->body, 'demo' => true])
            ->log('whatsapp message hidden from inbox');
    }

    private function seedEmail(User $sales, User $admin): void
    {
        // --- 1. New enquiry, unassigned, with an attachment ---
        $t1 = $this->thread('demo_th_1', 'Assignment brief — Operations Management (3000 words)', 'a.qureshi@student.example.ac.uk', 'Ayesha Qureshi', null, now()->subMinutes(18));
        $m1 = $this->mail($t1, 'in', 'Assignment brief — Operations Management (3000 words)',
            "Hello,\n\nI was referred to you by a classmate. I have attached the assignment brief for my Operations Management module — 3000 words, due on the 12th.\n\nCould you confirm the price and whether you can meet that deadline?\n\nMany thanks,\nAyesha Qureshi",
            now()->subMinutes(18), null,
            '<p>Hello,</p><p>I was referred to you by a classmate. I have attached the assignment brief for my <strong>Operations Management</strong> module — 3000 words, due on the 12th.</p><p>Could you confirm the price and whether you can meet that deadline?</p><p>Many thanks,<br>Ayesha Qureshi</p>',
        );
        EmailAttachment::query()->create([
            'message_id' => $m1->id,
            'gmail_attachment_id' => 'demo_att_1',
            'filename' => 'OM-Assignment-Brief.pdf',
            'mime_type' => 'application/pdf',
            'size' => 248_320,
            // No disk/path: demonstrates the "metadata only" state the UI
            // renders when a file was not mirrored locally.
        ]);

        // --- 2. Quote sent from the portal, then a reply ---
        $t2 = $this->thread('demo_th_2', 'Quote request — MBA dissertation', 'daniel.osei@example.com', 'Daniel Osei', $sales, now()->subHours(4));
        $this->mail($t2, 'in', 'Quote request — MBA dissertation',
            "Good afternoon,\n\nI'm looking for support with an MBA dissertation, roughly 12,000 words, topic is supply chain resilience post-pandemic. Timeline is about six weeks.\n\nWhat would that cost?\n\nRegards,\nDaniel",
            now()->subDays(1), null);
        $this->mail($t2, 'out', 'Re: Quote request — MBA dissertation',
            "Good afternoon Daniel,\n\nThank you for reaching out. For a 12,000-word MBA dissertation on supply chain resilience with a six-week timeline, our quote is PKR 78,000 (approx. GBP 210), payable in three milestones.\n\nThat includes:\n  • Topic refinement and proposal\n  • Full literature review\n  • Two rounds of revisions\n  • Turnitin similarity report\n\nHappy to jump on a call if that helps.\n\nBest regards,\n{$sales->name}\nProssignment",
            now()->subHours(20), $sales);
        $this->mail($t2, 'in', 'Re: Quote request — MBA dissertation',
            "That's within budget. Can we start Monday? Also — will the same writer handle all chapters?\n\nDaniel",
            now()->subHours(4), null);

        // --- 3. Complaint thread with a hidden message for the audit demo ---
        $t3 = $this->thread('demo_th_3', 'Revision request — order #1043', 'm.iqbal@example.com', 'Maryam Iqbal', $sales, now()->subHours(2));
        $this->mail($t3, 'in', 'Revision request — order #1043',
            "Hi,\n\nThe draft for order #1043 is good overall but the methodology section doesn't match what I asked for. Could this be revised please?\n\nMaryam",
            now()->subHours(6), null);

        $hidden = $this->mail($t3, 'out', 'Re: Revision request — order #1043',
            "Hi Maryam, honestly the writer misread the brief — I'll get it redone, sorry about that.",
            now()->subHours(5), $sales);
        $hidden->deleted_by = $sales->id;
        $hidden->save();
        $hidden->delete();

        activity('email_message')
            ->performedOn($hidden)
            ->causedBy($sales)
            ->withProperties(['subject' => $hidden->subject, 'demo' => true])
            ->log('email hidden from inbox');

        $this->mail($t3, 'out', 'Re: Revision request — order #1043',
            "Hi Maryam,\n\nThank you for flagging that. I've passed the methodology section back for revision and you'll have the updated draft within 48 hours at no extra cost.\n\nApologies for the inconvenience.\n\nBest regards,\n{$sales->name}",
            now()->subHours(2), $sales);
    }

    // ---- helpers ----

    private function contact(string $waId, string $name, ?User $assignee, Carbon $lastInbound): WhatsAppContact
    {
        return WhatsAppContact::query()->create([
            'wa_id' => $waId,
            'phone' => '+'.$waId,
            'profile_name' => $name,
            'assigned_to' => $assignee?->id,
            'last_message_at' => $lastInbound,
            'last_inbound_at' => $lastInbound,
        ]);
    }

    private function wa(WhatsAppContact $contact, string $dir, string $body, Carbon $at, ?User $sender = null): WhatsAppMessage
    {
        $inbound = $dir === 'in';

        return WhatsAppMessage::query()->create([
            'contact_id' => $contact->id,
            'wamid' => 'wamid.DEMO_'.uniqid(),
            'direction' => $inbound ? WhatsAppDirection::Inbound : WhatsAppDirection::Outbound,
            'type' => WhatsAppMessageType::Text,
            'body' => $body,
            'sender_id' => $sender?->id,
            'status' => $inbound ? WhatsAppMessageStatus::Delivered : WhatsAppMessageStatus::Read,
            'sent_at' => $at,
            'delivered_at' => $at,
            'read_at' => $inbound ? null : $at,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }

    private function thread(string $gmailId, string $subject, string $email, string $name, ?User $assignee, Carbon $last): EmailThread
    {
        return EmailThread::query()->create([
            'gmail_thread_id' => $gmailId,
            'subject' => $subject,
            'contact_email' => $email,
            'contact_name' => $name,
            'assigned_to' => $assignee?->id,
            'last_message_at' => $last,
            'last_inbound_at' => $last,
        ]);
    }

    private function mail(EmailThread $thread, string $dir, string $subject, string $body, Carbon $at, ?User $sender, ?string $html = null): EmailMessage
    {
        $inbound = $dir === 'in';
        $mailbox = (string) (config('gmail.mailbox') ?: 'info@prossignment.test');

        $message = EmailMessage::query()->create([
            'thread_id' => $thread->id,
            'gmail_message_id' => 'demo_msg_'.uniqid(),
            'rfc_message_id' => '<'.uniqid().'@demo>',
            'direction' => $inbound ? EmailDirection::Inbound : EmailDirection::Outbound,
            'from_email' => $inbound ? $thread->contact_email : $mailbox,
            'from_name' => $inbound ? $thread->contact_name : (string) config('gmail.from_name', 'Prossignment'),
            'to' => $inbound
                ? [['email' => $mailbox, 'name' => 'Prossignment']]
                : [['email' => $thread->contact_email, 'name' => $thread->contact_name]],
            'subject' => $subject,
            'snippet' => \Illuminate\Support\Str::limit(strip_tags($body), 140),
            'body_text' => $body,
            'body_html' => $html,
            'sender_id' => $sender?->id,
            // Outbound with no rep = sent from Gmail directly.
            'via_mail_client' => ! $inbound && $sender === null,
            'status' => $inbound ? EmailMessageStatus::Received : EmailMessageStatus::Sent,
            'is_read' => ! $inbound,
            'sent_at' => $at,
            'created_at' => $at,
            'updated_at' => $at,
        ]);

        $thread->forceFill([
            'message_count' => $thread->messages()->count(),
            'last_message_at' => $at,
        ])->save();

        return $message;
    }
}
