<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SettingController extends Controller
{
    private const DEFAULTS = [
        'portal_name' => 'Prossignment Portal',
        'company_name' => 'Prossignment',
        'contact_email' => 'support@prossignment.com',
        'contact_phone' => '+92 300 1234567',
        'max_file_size' => '20',
        'allowed_extensions' => 'pdf,docx,zip,png,jpg',
    ];

    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can manage settings.', 403);
        }

        $settings = [];
        foreach (self::DEFAULTS as $key => $default) {
            $settings[$key] = Setting::get($key, $default);
        }

        return ApiResponse::item($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can save settings.', 403);
        }

        $validated = $request->validate([
            'portal_name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:100'],
            'max_file_size' => ['required', 'integer', 'min:1', 'max:500'],
            'allowed_extensions' => ['required', 'string', 'max:2000'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value);
        }

        $settings = [];
        foreach (self::DEFAULTS as $key => $default) {
            $settings[$key] = Setting::get($key, $default);
        }

        return ApiResponse::item($settings);
    }
}
