<?php

namespace App\Http\Controllers\Api;

/**
 * @OA\Info(
 *     title="PPS Business Cards API",
 *     version="1.0.0",
 *     description="API documentation for PPS Business Cards"
 * )
 * 
 * @OA\Server(url="http://127.0.0.1:8000", description="Local server")
 * @OA\Server(url="https://test.ppsbusinesscards.de/", description="Test server")
 * @OA\Server(url="https://app.ppsbusinesscards.de/", description="Production server")
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter your bearer token in the format **Bearer &lt;token>**"
 * )
 */
class OpenApiInfo
{
    // This class only exists to hold top-level OpenAPI annotations.
}
