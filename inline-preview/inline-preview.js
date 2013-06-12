jQuery( function ( $ ) {
	$( '#post-preview' ).on( 'click', function () {
		if ( $( '#inline-preview-container' ).length == 0 ) {
			var windowWidth = $( document ).width();
			
			// Editor width in percent.
			var editorWidth = 60;
			
			if ( localStorage['inline-preview-width'] )
				editorWidth = 100 - localStorage['inline-preview-width'];
			
			var editorWidthPx = Math.round( windowWidth * ( editorWidth / 100 ) );
			var previewWidthPx = Math.round( windowWidth * ( ( 100 - editorWidth ) / 100 ) );

			$( 'body' ).addClass( 'inline-preview' );
			
			var editorContainer = $( '#wpwrap' );
			var previewContainer = $( '<div id="inline-preview-container"><iframe name="wp-preview"></iframe></div>' ).css( 'width', previewWidthPx ).css( 'left', windowWidth );
			
			if ( $( '#post-body' ).hasClass( 'columns-2' ) )
				$( '#post-body' ).removeClass( 'columns-2' ).addClass( 'columns-1' ).data( 'inline-preview-modified', true );

			editorContainer
				.before( previewContainer )
				.animate(
					{ 'padding-right' : previewWidthPx },
					{ duration : 1000, queue : false }
				);
			
			previewContainer
				.animate(
					{ 'left' : editorWidthPx },
					{ duration : 1000, queue : false, complete : function () {
						previewContainer
							.append(
								$( '<a id="inline-preview-close">X</a>' )
									.on( 'click', function ( e ) {
										e.preventDefault();
										
										$( this ).hide();

										previewContainer
											.animate(
												{ 'left' : $( window ).width() },
												{ duration : 1000, queue : false, complete : function () {
													if ( $( '#post-body' ).data( 'inline-preview-modified' ) )
														$( '#post-body' ).removeClass( 'columns-1' ).addClass( 'columns-2' ).data( 'inline-preview-columns', null );

													previewContainer.remove();
													$( 'body' ).removeClass( 'inline-preview' );
												} }
											);
										editorContainer.animate(
											{ 'padding-right' : '0' },
											{ duration : 1000, queue : false }
										);
									} )
							)
							.css( 'z-index', '1000' );
					} }
				);
			
			previewContainer.resizable( {
				minWidth : 100,
				handles : "w",
				start : function () {
					previewContainer.css( 'z-index', '' );
				},
				resize : function ( event, ui ) {
					var totalWidth = previewContainer.parent().width();
					editorContainer.css( 'padding-right', ui.size.width );
				},
				stop : function ( event, ui ) {
					var totalWidth = previewContainer.parent().width();
					localStorage['inline-preview-width'] = Math.round( ui.size.width / totalWidth * 100 );
					previewContainer.css( 'z-index', '1000' );
				}
			} );
		}
	} );
} );