<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Two-Factor Authentication Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333333;
            margin-bottom: 20px;
        }

        .code {
            display: inline-block;
            font-size: 28px;
            font-weight: bold;
            color: #1a73e8;
            background-color: #eef3fc;
            padding: 12px 20px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .text {
            font-size: 16px;
            color: #555555;
            line-height: 1.6;
        }

        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #888888;
        }
    </style>
</head>

<body>
    <div class="container">
        <div style="margin-bottom: 20px; text-align: center;">
            <img src="/assets/images/pps_logo.svg" alt="">
        </div>
        <div class="header">Two-Factor Authentication Code</div>

        <div class="text">
            This is your Two-Factor Authentication (2FA) code for <strong>{{ config('app.name') }}</strong>:
        </div>

        <div style="text-align:center;">
            <div class="code">{{ $code }}</div>
        </div>

        <div class="text">
            This code will expire in 10 minutes.<br><br>
            If you did not request this, please ignore this email.
        </div>

        <div class="footer">
            Thanks,<br>
            {{ config('app.name') }}
        </div>
    </div>
</body>

</html>