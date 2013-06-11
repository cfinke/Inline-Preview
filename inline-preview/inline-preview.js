jQuery( function ( $ ) {
	$( '#post-preview' ).on( 'click', function () {
		if ( $( '#inline-preview-container' ).length == 0 ) {
			$( 'body' ).addClass( 'inline-preview' );
			$( '<div id="inline-preview-container"><iframe name="wp-preview"></iframe></div>' ).insertBefore( '#wpwrap' );
			$( '#post-body' ).removeClass( 'columns-2' ).addClass( 'columns-1' );
		}
	} );
} );