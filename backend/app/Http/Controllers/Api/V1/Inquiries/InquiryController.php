<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Inquiries;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inquiries\StoreInquiryRequest;
use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

final class InquiryController extends Controller
{
    /** Public landing-page enquiry form: persist first, then email the studio. */
    public function store(StoreInquiryRequest $request): JsonResponse
    {
        $inquiry = Inquiry::create($request->validated());

        // Notify the studio inbox. Persistence already succeeded, so never let
        // a mail/SMTP failure turn a saved enquiry into an error for the visitor.
        try {
            $inbox = Config::get('mail.inquiries_to')
                ?? Config::get('mail.from.address');
            Mail::to($inbox)->send(new InquiryReceived($inquiry));
        } catch (\Throwable $e) {
            report($e);
        }

        return ApiResponse::item(
            ['message' => 'Thanks — your enquiry has been received. We usually reply the same day.'],
            201,
        );
    }
}
