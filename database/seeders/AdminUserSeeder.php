<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'futuretest45@gmail.com'], // Unique field
            [
                'name' => 'Admin',
                'password' => Hash::make('asdfasdf'), // Change to something secure
                'role' => 'admin',
                'status' => 1,
            ]
        );
    }
}
