<?php

namespace App\Http\Controllers\Api;

/**
 * @OA\Info(
 *     title="PPS Business Cards API",
 *     version="1.0.0",
 *     description="API documentation for PPS Business Cards"
 * )
 * @OA\Server(url="/", description="Local server")
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
