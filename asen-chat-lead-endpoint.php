<?php
/**
 * Plugin Name: Asen Chat Lead Endpoint
 * Description: Secure endpoint for chatbot lead submissions into Gravity Forms.
 */

defined('ABSPATH') || exit;

add_action('admin_post_nopriv_asen_chat_lead', 'asen_chat_lead_handler');
add_action('admin_post_asen_chat_lead', 'asen_chat_lead_handler');

function asen_chat_lead_handler() {
    if ('POST' !== $_SERVER['REQUEST_METHOD']) {
        wp_send_json_error(['message' => 'Method not allowed'], 405);
    }

    $expected_secret = defined('ASEN_CHAT_SECRET') ? ASEN_CHAT_SECRET : '';
    $received_secret = $_SERVER['HTTP_X_ASEN_CHAT_SECRET'] ?? '';

    if (! $expected_secret || ! hash_equals($expected_secret, $received_secret)) {
        wp_send_json_error(['message' => 'Unauthorized'], 403);
    }

    if (! class_exists('GFAPI')) {
        wp_send_json_error(['message' => 'Gravity Forms is not available'], 500);
    }

    $raw_body = file_get_contents('php://input');
    $data     = json_decode($raw_body, true);

    if (! is_array($data)) {
        wp_send_json_error(['message' => 'Invalid JSON body'], 400);
    }

    $form_id = absint($data['formId'] ?? 0);

    if (! $form_id) {
        wp_send_json_error(['message' => 'Missing formId'], 400);
    }

    $input_values = [
        'input_15.3'  => sanitize_text_field($data['firstName'] ?? ''),
        'input_15.6'  => sanitize_text_field($data['lastName'] ?? ''),
        'input_2'     => sanitize_email($data['email'] ?? ''),
        'input_3'     => sanitize_text_field($data['businessName'] ?? ''),
        'input_37'    => sanitize_text_field($data['timeline'] ?? ''),
        'input_36'    => sanitize_text_field($data['budget'] ?? ''),
        'input_9'     => sanitize_text_field($data['phone'] ?? ''),
        'input_16'    => esc_url_raw($data['website'] ?? ''),
        'input_35'    => sanitize_textarea_field($data['primaryChallenge'] ?? ''),
        'input_26889' => sanitize_textarea_field($data['additionalInfo'] ?? ''),
    ];

    $result = GFAPI::submit_form($form_id, $input_values);

    if (is_wp_error($result)) {
        wp_send_json_error([
            'message' => $result->get_error_message(),
            'errors'  => $result->get_error_data(),
        ], 400);
    }

    wp_send_json_success([
        'message' => 'Lead submitted successfully',
        'result'  => $result,
    ]);
}