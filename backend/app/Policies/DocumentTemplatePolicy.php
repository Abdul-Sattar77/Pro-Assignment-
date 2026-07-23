<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\DocumentTemplate;
use App\Models\User;

/**
 * Authorization policies for Document Template resource access.
 */
final class DocumentTemplatePolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value) || $actor->can('document_templates.view');
    }

    public function view(User $actor, DocumentTemplate $documentTemplate): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value) || $actor->can('document_templates.view');
    }

    public function create(User $actor): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value) || $actor->can('document_templates.manage');
    }

    public function update(User $actor, DocumentTemplate $documentTemplate): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value) || $actor->can('document_templates.manage');
    }

    public function delete(User $actor, DocumentTemplate $documentTemplate): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value) || $actor->can('document_templates.manage');
    }
}
