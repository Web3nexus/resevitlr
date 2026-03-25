<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $subject }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #2c3e50;">{{ $subject }}</h2>
        
        <div style="margin-top: 20px;">
            {!! nl2br(e($content)) !!}
        </div>
        
        @if(isset($data) && count($data) > 0)
            <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
                <h3 style="margin-top: 0; font-size: 16px;">Details:</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                    @foreach($data as $key => $value)
                        <li style="margin-bottom: 5px;"><strong>{{ ucwords(str_replace('_', ' ', $key)) }}:</strong> {{ $value }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        
        <div style="margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
            This is an automated message from Resevit.
        </div>
    </div>
</body>
</html>
