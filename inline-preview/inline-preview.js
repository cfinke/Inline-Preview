jQuery( function ( $ ) {
	var animationDuration = 500,
		autoPreviewTimer = null,
		livePreviewInterval = 10000;
	
	function livePreviewReload() {
		var previewFrame = $( '#inline-preview-iframe' ),
			previewFrameWindow = $( previewFrame.get(0).contentWindow );
		
		var iframeScrollLocation = previewFrameWindow.scrollTop();
		
		$( '#post-preview' ).click();
		
		previewFrame.on( 'load.inline-preview', function () {
			$( this ).off( 'load.inline-preview' );
			
			previewFrameWindow.scrollTop( iframeScrollLocation );
			
			clearTimeout( autoPreviewTimer );
			autoPreviewTimer = setTimeout( livePreviewReload, livePreviewInterval );
		} );
	}
	
	$( '#post-preview' ).on( 'click', function () {
		if ( $( '#inline-preview-container' ).length > 0 )
			return;
		
		var windowWidth = $( document ).width();
		
		// Editor width in percent.
		var editorWidth = 60;
		
		if ( localStorage['inline-preview-width'] )
			editorWidth = 100 - localStorage['inline-preview-width'];
		
		var editorWidthPx = Math.round( windowWidth * ( editorWidth / 100 ) );
		var previewWidthPx = Math.round( windowWidth * ( ( 100 - editorWidth ) / 100 ) );

		$( 'body' ).addClass( 'inline-preview' );
		
		var editorContainer = $( '#wpwrap' );
		var previewContainer = $( '<div id="inline-preview-container"><iframe name="wp-preview" id="inline-preview-iframe""></iframe></div>' ).css( 'width', previewWidthPx ).css( 'left', windowWidth );
		
		if ( $( '#post-body' ).hasClass( 'columns-2' ) ) {
			var postBodyClass = 'columns-2';
			$( '#post-body' ).removeClass( 'columns-2' ).addClass( 'columns-1' );
		}
		else {
			var postBodyClass = 'columns-1';
		}

		editorContainer
			.before( previewContainer )
			.animate(
				{ 'padding-right' : previewWidthPx },
				{ duration : animationDuration, queue : false }
			);
		
		previewContainer
			.animate(
				{ 'left' : editorWidthPx },
				{ duration : animationDuration, queue : false, complete : function () {
					previewContainer
						.append(
							$( '<a id="inline-preview-close">X</a>' )
								.on( 'click', function ( e ) {
									e.preventDefault();
									
									$( this ).hide();

									previewContainer
										.animate(
											{ 'left' : $( window ).width() },
											{ duration : animationDuration, queue : false, complete : function () {
												$( '#post-body' ).removeClass( 'columns-1' ).addClass( postBodyClass );

												previewContainer.remove();
												$( 'body' ).removeClass( 'inline-preview' );
											} }
										);
									editorContainer.animate(
										{ 'padding-right' : '0' },
										{ duration : animationDuration, queue : false }
									);
									
									clearTimeout( autoPreviewTimer );
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
		
		// autoPreviewTimer = setTimeout( livePreviewReload, livePreviewInterval );
	} );
} );