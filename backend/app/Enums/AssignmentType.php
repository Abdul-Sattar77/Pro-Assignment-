<?php

declare(strict_types=1);

namespace App\Enums;

/** The kind of academic work requested. Stored as a slug for clean filtering. */
enum AssignmentType: string
{
    case Essay = 'essay';
    case Report = 'report';
    case ResearchPaper = 'research_paper';
    case Dissertation = 'dissertation';
    case Thesis = 'thesis';
    case Coursework = 'coursework';
    case CaseStudy = 'case_study';
    case LiteratureReview = 'literature_review';
    case Presentation = 'presentation';
    case Programming = 'programming';
    case Editing = 'editing';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Essay => 'Essay',
            self::Report => 'Report',
            self::ResearchPaper => 'Research paper',
            self::Dissertation => 'Dissertation',
            self::Thesis => 'Thesis',
            self::Coursework => 'Coursework',
            self::CaseStudy => 'Case study',
            self::LiteratureReview => 'Literature review',
            self::Presentation => 'Presentation',
            self::Programming => 'Programming / coding',
            self::Editing => 'Editing & proofreading',
            self::Other => 'Other',
        };
    }

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_map(static fn (self $c): string => $c->value, self::cases());
    }
}
