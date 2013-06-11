<?php

/*
Plugin Name: Inline Preview
Plugin URI: http://www.chrisfinke.com/wordpress/plugins/inline-preview
Description: Adds a post preview next to the editor instead of in a new tab.
Version: 1.0
Author: Christopher Finke
Author URI: http://www.chrisfinke.com/
License: GPLv2
*/

function inline_preview_enqueue( $hook ) {
	if ( 'post-new.php' != $hook && 'post.php' != $hook )
		return;

	wp_enqueue_script( 'inline-preview', plugins_url( 'inline-preview/inline-preview.js', __FILE__ ), array( 'jquery', 'jquery.spin' ), true );
	wp_enqueue_style( 'inline-preview', plugins_url( 'inline-preview/inline-preview.css', __FILE__ ) );
}

add_action( 'admin_enqueue_scripts', 'inline_preview_enqueue' );