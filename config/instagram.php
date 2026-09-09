<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Instagram Public Feed
    |--------------------------------------------------------------------------
    |
    | Used by the public Instagram section on the homepage. The feed is fetched
    | directly from Instagram's public web endpoint (no login / no access token
    | required) and cached server-side so the content always stays up to date
    | without hammering Instagram.
    |
    */

    'username' => 'disperdagin_kotakediri',

    // How long (in seconds) the feed is cached before re-fetching.
    'cache_ttl' => 3600,

    // How many latest posts to display.
    'limit' => 8,

    /*
    |--------------------------------------------------------------------------
    | External Widget Fallback
    |--------------------------------------------------------------------------
    |
    | If the built-in feed fails (e.g. Instagram rate-limits the server IP),
    | the section automatically falls back to a free third-party widget.
    | Supported providers: "lightwidget" (free permanent) or "snapwidget".
    | Create a free widget for @disperdagin_kotakediri and paste its embed
    | ID below. Leave null to use the profile link fallback instead.
    |
    */
    'fallback_provider' => 'lightwidget',
    'fallback_embed_id' => null,

];
