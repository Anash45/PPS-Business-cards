<?php

namespace App\Helpers;

class RoleHelper
{
    public static function displayName(string $role): string
    {
        return match ($role) {
            'admin' => 'Super Admin',
            'company' => 'Company Owner',
            'template_editor' => 'Template + Card Editor',
            'editor' => 'Card Editor',
            default => ucfirst(str_replace('_', ' ', $role)),
        };
    }
}