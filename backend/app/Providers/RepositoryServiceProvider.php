<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\CalendarEventRepositoryInterface;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use App\Repositories\Contracts\FileRepositoryInterface;
use App\Repositories\Contracts\InvoiceRepositoryInterface;
use App\Repositories\Contracts\LeadRepositoryInterface;
use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WriterRatingRepositoryInterface;
use App\Repositories\Contracts\ComplaintRepositoryInterface;
use App\Repositories\Contracts\DocumentTemplateRepositoryInterface;
use App\Repositories\Contracts\ActivityRepositoryInterface;
use App\Repositories\Eloquent\AssignmentRepository;
use App\Repositories\Eloquent\CalendarEventRepository;
use App\Repositories\Eloquent\ConversationRepository;
use App\Repositories\Eloquent\FileRepository;
use App\Repositories\Eloquent\InvoiceRepository;
use App\Repositories\Eloquent\LeadRepository;
use App\Repositories\Eloquent\MessageRepository;
use App\Repositories\Eloquent\PaymentRepository;
use App\Repositories\Eloquent\TaskRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Eloquent\WriterRatingRepository;
use App\Repositories\Eloquent\ComplaintRepository;
use App\Repositories\Eloquent\DocumentTemplateRepository;
use App\Repositories\Eloquent\ActivityRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Binds repository contracts to their Eloquent implementations so services can
 * depend on interfaces (dependency inversion). Add one entry per repository as
 * modules are built — this is the single wiring point for the data layer.
 */
final class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Contract => Implementation.
     *
     * @var array<class-string, class-string>
     */
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
        AssignmentRepositoryInterface::class => AssignmentRepository::class,
        LeadRepositoryInterface::class => LeadRepository::class,
        TaskRepositoryInterface::class => TaskRepository::class,
        CalendarEventRepositoryInterface::class => CalendarEventRepository::class,
        FileRepositoryInterface::class => FileRepository::class,
        ConversationRepositoryInterface::class => ConversationRepository::class,
        MessageRepositoryInterface::class => MessageRepository::class,
        InvoiceRepositoryInterface::class => InvoiceRepository::class,
        PaymentRepositoryInterface::class => PaymentRepository::class,
        WriterRatingRepositoryInterface::class => WriterRatingRepository::class,
        ComplaintRepositoryInterface::class => ComplaintRepository::class,
        DocumentTemplateRepositoryInterface::class => DocumentTemplateRepository::class,
        ActivityRepositoryInterface::class => ActivityRepository::class,
    ];
}
