jQuery( function ( $ ) {
	$( '#post-preview' ).on( 'click', function () {
		if ( $( '#inline-preview-container' ).length == 0 ) {
			// Editor width in percent.
			var editorWidth = 60;
			
			$( 'body' ).addClass( 'inline-preview' );
			
			var editorContainer = $( '#wpwrap' );
			var previewContainer = $( '<div id="inline-preview-container"><iframe name="wp-preview"></iframe></div>' );
			
			if ( $( '#post-body' ).hasClass( 'columns-2' ) )
				$( '#post-body' ).removeClass( 'columns-2' ).addClass( 'columns-1' ).data( 'inline-preview-modified', true );

			editorContainer
				.before( previewContainer )
				.animate(
					{ 'width' : editorWidth + '%' },
					{ duration : 1000, queue : false }
				);
			
			previewContainer
				.animate(
					{ 'width' : ( 100 - editorWidth ) + '%' },
					{ duration : 1000, queue : false, complete : function () {
						previewContainer
							.append(
								$( '<a id="inline-preview-close">X</a>' )
									.on( 'click', function ( e ) {
										e.preventDefault();
										
										$( this ).hide();

										previewContainer
											.animate(
												{ 'width' : '0' },
												{ duration : 1000, queue : false, complete : function () {
													if ( $( '#post-body' ).data( 'inline-preview-modified' ) )
														$( '#post-body' ).removeClass( 'columns-1' ).addClass( 'columns-2' ).data( 'inline-preview-columns', null );

													previewContainer.remove();
													$( 'body' ).removeClass( 'inline-preview' );
												} }
											);
										editorContainer.animate(
											{ 'width' : '100%' },
											{ duration : 1000, queue : false }
										);
									} )
							)
					} }
				);
		}
	} );
} );