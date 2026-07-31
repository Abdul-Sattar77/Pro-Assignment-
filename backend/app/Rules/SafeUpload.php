<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Rejects uploads whose extension could be executed as code on the server or in
 * a victim's browser (web shells, scripts, binaries). The product intentionally
 * accepts broad file types (documents, media, archives), so this is a denylist
 * of dangerous types rather than a strict allowlist.
 */
final class SafeUpload implements ValidationRule
{
    /** @var array<int, string> */
    private const BLOCKED = [
        'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phps', 'phar', 'inc',
        'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'dll', 'sys',
        'sh', 'bash', 'zsh', 'ps1', 'psm1', 'vbs', 'vbe', 'wsf', 'hta',
        'js', 'mjs', 'cjs', 'jsx', 'cgi', 'pl', 'py', 'rb', 'jar', 'war',
        'htaccess', 'htpasswd',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value instanceof UploadedFile) {
            return;
        }

        $ext = strtolower($value->getClientOriginalExtension());

        if (in_array($ext, self::BLOCKED, true)) {
            $fail('This file type is not allowed for security reasons.');
        }
    }
}
