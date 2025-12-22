<?php

namespace App\Http\Controllers;

use App\Models\NfcCard;
use Illuminate\Http\Request;

class NfcCardsController extends Controller
{
    public function addSingle(Request $request)
    {
        // Validate the incoming request data
        $validated = $request->validate([
            'qr_code' => 'required|string|exists:nfc_cards,qr_code',
        ]);

        // Find the NFC card by QR code
        $nfcCard = NfcCard::where('qr_code', $validated['qr_code'])->first();
        if (!$nfcCard) {
            return response()->json(['message' => 'NFC Card not found for this QR code'], 404);
        }

        // Only assign company if not already set
        if (is_null($nfcCard->company_id)) {
            $user = $request->user();
            $companyId = $user->isCompany() ? $user->companyProfile->id : $user->company_id;
            $nfcCard->company_id = $companyId;
            $nfcCard->save();
        }else{
            return response()->json(['message' => 'NFC Card is already assigned to a company'], 400);
        }

        return response()->json(['message' => 'NFC Card assigned successfully', 'nfcCard' => $nfcCard], 200);
    }

    public function addMultiple(Request $request)
    {
        // Validate the incoming request data
        $validated = $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120', // Max 5MB
        ]);

        // Get the uploaded file
        $file = $request->file('csv_file');
        $path = $file->getRealPath();

        // Open and read the CSV file
        $handle = fopen($path, 'r');
        if (!$handle) {
            return response()->json(['message' => 'Unable to open CSV file'], 400);
        }

        // Read the header row and check for 'qr_code' column (case-insensitive)
        $header = fgetcsv($handle);
        $qrCodeIndex = null;
        foreach ($header as $index => $column) {
            if (strtolower(trim($column)) === 'qr_code') {
                $qrCodeIndex = $index;
                break;
            }
        }
        if ($qrCodeIndex === null) {
            fclose($handle);
            return response()->json(['message' => 'CSV file must contain a "qr_code" column'], 400);
        }

        // Collect QR codes from the CSV
        $qrCodes = [];
        while (($row = fgetcsv($handle)) !== false) {
            if (isset($row[$qrCodeIndex]) && !empty(trim($row[$qrCodeIndex]))) {
                $qrCodes[] = trim($row[$qrCodeIndex]);
            }
        }
        fclose($handle);

        if (empty($qrCodes)) {
            return response()->json(['message' => 'No valid QR codes found in CSV'], 400);
        }

        // Check all NFC cards exist and are not assigned
        $errors = [];
        $validCards = [];
        foreach ($qrCodes as $qrCode) {
            $nfcCard = NfcCard::where('qr_code', $qrCode)->first();
            if (!$nfcCard) {
                $errors[] = "NFC Card not found for QR code: {$qrCode}";
            } elseif (!is_null($nfcCard->company_id)) {
                $errors[] = "NFC Card for {$qrCode} QR code is already assigned to a company.";
            } else {
                $validCards[] = $nfcCard;
            }
        }

        if (!empty($errors)) {
            return response()->json(['message' => 'Validation failed', 'errors' => $errors], 400);
        }

        // Assign all valid cards to the user's company
        $user = $request->user();
        $companyId = $user->isCompany() ? $user->companyProfile->id : $user->company_id;
        foreach ($validCards as $nfcCard) {
            $nfcCard->company_id = $companyId;
            $nfcCard->save();
        }

        return response()->json(['message' => 'NFC Cards assigned successfully', 'assignedCards' => $validCards], 200);
    }
}
