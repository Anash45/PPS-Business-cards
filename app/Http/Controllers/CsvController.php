<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CsvController extends Controller
{
    public function index()
    {
        return inertia('Csv/Index');
    }
}
