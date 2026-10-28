<?php
/**
 * Plugin Name: Varkuzo Newsletter
 * Description: Saves explicit newsletter consent and a reserved first-purchase benefit.
 * Version: 0.1.0
 */

if (!defined('ABSPATH')) exit;

function varkuzo_newsletter_table() {
    global $wpdb;
    return $wpdb->prefix . 'varkuzo_newsletter';
}

function varkuzo_newsletter_install() {
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $table = varkuzo_newsletter_table();
    $charset = $wpdb->get_charset_collate();
    dbDelta("CREATE TABLE $table (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        email varchar(254) NOT NULL,
        consent_version varchar(20) NOT NULL,
        source varchar(20) NOT NULL,
        discount_percent tinyint(3) unsigned NOT NULL DEFAULT 10,
        consented_at datetime NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY email (email)
    ) $charset;");
}
register_activation_hook(__FILE__, 'varkuzo_newsletter_install');

add_action('rest_api_init', function () {
    register_rest_route('varkuzo/v1', '/newsletter', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'varkuzo_newsletter_subscribe',
        'permission_callback' => function (WP_REST_Request $request) {
            $provided = $request->get_header('x-varkuzo-internal-key');
            return defined('VARKUZO_NEWSLETTER_KEY') && VARKUZO_NEWSLETTER_KEY && is_string($provided) && hash_equals(VARKUZO_NEWSLETTER_KEY, $provided);
        },
    ]);
});

function varkuzo_newsletter_subscribe(WP_REST_Request $request) {
    global $wpdb;
    $email = strtolower(trim((string) $request->get_param('email')));
    $source = sanitize_key((string) $request->get_param('source'));
    $consent = $request->get_param('consent');
    if (!is_email($email) || strlen($email) > 254 || $consent !== true || !in_array($source, ['entry', 'cart'], true)) {
        return new WP_Error('invalid_newsletter', 'Revisa el correo y autoriza el envío de novedades.', ['status' => 400]);
    }

    $ip = (string) $request->get_header('x-varkuzo-client-ip');
    $rate_key = 'vkz_nl_' . hash_hmac('sha256', $ip, wp_salt('auth'));
    $attempts = (int) get_transient($rate_key);
    if ($attempts >= 6) return new WP_Error('newsletter_rate_limit', 'Intenta nuevamente más tarde.', ['status' => 429]);
    set_transient($rate_key, $attempts + 1, HOUR_IN_SECONDS);

    $table = varkuzo_newsletter_table();
    $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE email = %s", $email));
    if (!$existing) {
        $saved = $wpdb->insert($table, [
            'email' => $email,
            'consent_version' => '2026-10-28',
            'source' => $source,
            'discount_percent' => 10,
            'consented_at' => current_time('mysql', true),
        ], ['%s', '%s', '%s', '%d', '%s']);
        if (!$saved) return new WP_Error('newsletter_storage', 'No pudimos guardar tu correo. Intenta de nuevo.', ['status' => 503]);
    }
    return rest_ensure_response(['subscribed' => true, 'discountPercent' => 10]);
}
