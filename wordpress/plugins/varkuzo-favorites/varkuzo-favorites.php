<?php
/**
 * Plugin Name: Varkuzo Favorites
 * Description: Stores one favorite per browser and product for the Varkuzo storefront.
 * Version: 0.1.0
 */

if (!defined('ABSPATH')) exit;

function varkuzo_favorites_table() {
    global $wpdb;
    return $wpdb->prefix . 'varkuzo_favorites';
}

function varkuzo_favorites_install() {
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $table = varkuzo_favorites_table();
    $charset = $wpdb->get_charset_collate();
    dbDelta("CREATE TABLE $table (
        product_slug varchar(180) NOT NULL,
        visitor_hash char(64) NOT NULL,
        created_at datetime NOT NULL,
        PRIMARY KEY  (product_slug, visitor_hash),
        KEY product_slug (product_slug)
    ) $charset;");
}
register_activation_hook(__FILE__, 'varkuzo_favorites_install');

add_action('rest_api_init', function () {
    register_rest_route('varkuzo/v1', '/favorites', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'varkuzo_favorites_counts',
            'permission_callback' => '__return_true',
        ],
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'varkuzo_favorites_update',
            'permission_callback' => function (WP_REST_Request $request) {
                $provided = $request->get_header('x-varkuzo-internal-key');
                return defined('VARKUZO_FAVORITES_KEY') && VARKUZO_FAVORITES_KEY && is_string($provided) && hash_equals(VARKUZO_FAVORITES_KEY, $provided);
            },
        ],
    ]);
});

function varkuzo_favorites_counts(WP_REST_Request $request) {
    global $wpdb;
    $slugs = array_slice(array_unique(array_filter(array_map('sanitize_title', explode(',', (string) $request->get_param('slugs'))))), 0, 50);
    if (!$slugs) return rest_ensure_response(['counts' => []]);
    $table = varkuzo_favorites_table();
    $placeholders = implode(',', array_fill(0, count($slugs), '%s'));
    $query = $wpdb->prepare("SELECT product_slug, COUNT(*) AS total FROM $table WHERE product_slug IN ($placeholders) GROUP BY product_slug", $slugs);
    $rows = $wpdb->get_results($query);
    $counts = array_fill_keys($slugs, 0);
    foreach ($rows as $row) $counts[$row->product_slug] = (int) $row->total;
    return rest_ensure_response(['counts' => $counts]);
}

function varkuzo_favorites_update(WP_REST_Request $request) {
    global $wpdb;
    $slug = sanitize_title((string) $request->get_param('slug'));
    $visitor = (string) $request->get_header('x-varkuzo-visitor');
    $saved = $request->get_param('saved');
    if (!$slug || strlen($slug) > 180 || !preg_match('/^[a-f0-9-]{36}$/i', $visitor) || !is_bool($saved)) {
        return new WP_Error('invalid_favorite', 'Invalid favorite request.', ['status' => 400]);
    }
    $hash = hash('sha256', $visitor);
    $table = varkuzo_favorites_table();
    if ($saved) {
        $wpdb->query($wpdb->prepare("INSERT IGNORE INTO $table (product_slug, visitor_hash, created_at) VALUES (%s, %s, %s)", $slug, $hash, current_time('mysql', true)));
    } else {
        $wpdb->delete($table, ['product_slug' => $slug, 'visitor_hash' => $hash], ['%s', '%s']);
    }
    $count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table WHERE product_slug = %s", $slug));
    return rest_ensure_response(['slug' => $slug, 'saved' => $saved, 'count' => $count]);
}
