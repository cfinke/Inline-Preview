jQuery( function ( $ ) {
	var inlinePreview = {
		animationDuration : 500,
		interval : 3000,
		userIsActive : false,
		reloadTimer : null,
		resizeTimer : null,
		autoClicking : false,

		editorContainer : $( '#wpwrap' ),
		postBodyClass : null,
		
		/**
		 * Set up the handlers to activate inline preview.
		 */
		init : function () {
			var self = this;

			$( '#post-preview' ).on( 'click.inline-preview', function () {
				self.preview();
			} );
			
			$( 'a[id!="post-preview"][href$="preview=true"]' ).on( 'click.inline-preview', function ( e ) {
				e.preventDefault();
				
				$( '#post-preview' ).click();
			} );
		},
		
		/**
		 * The user has initiated a preview.
		 */
		preview : function () {
			var self = this;
			
			if ( $( '#inline-preview-container' ).length > 0 )
				return;

			$( 'body' ).addClass( 'inline-preview' );

			var previewContainer = $( '<div/>' )
				.attr( 'id', 'inline-preview-container' )
				.hide()
				.append(
					$( '<iframe/>' )
						.attr( 'id', 'inline-preview-iframe' )
						.attr( 'name', $( '#post-preview' ).attr( 'target' ) || 'wp-preview' )
				);

			self.editorContainer.before( previewContainer );

			if ( $( '#post-body' ).hasClass( 'columns-2' ) ) {
				self.postBodyClass = 'columns-2';
				$( '#post-body' ).removeClass( 'columns-2' ).addClass( 'columns-1' );
			}
			else {
				self.postBodyClass = 'columns-1';
			}

			previewContainer.addClass( 'loading' );

			this.setContainerWidth( true );

			previewContainer.resizable( {
				minWidth : 100,
				handles : "w",
				start : function () {
					previewContainer.css( 'z-index', '' );
				},
				resize : function ( event, ui ) {
					var totalWidth = previewContainer.parent().width();
					self.editorContainer.css( 'padding-right', ui.size.width );
				},
				stop : function ( event, ui ) {
					var totalWidth = previewContainer.parent().width();
					localStorage['inline-preview-width'] = Math.round( ui.size.width / totalWidth * 100 );
					previewContainer.css( 'z-index', '1000' );
				}
			} );

			$( '#inline-preview-iframe' ).on( 'load.inline-preview', function () {
				self.userIsActive = false;
				previewContainer.removeClass( 'loading' );
				var previewIframeName = $( this ).attr( 'name' );
				$( this ).unbind( 'load.inline-preview' ).removeAttr( 'name' );
				$( '#inline-preview-container' ).append( $( '<iframe id="inline-preview-hidden-iframe"></iframe>' ).attr( 'name', previewIframeName ) );
			} );

			// Don't continually refresh the iframe if nothing is happening.
			$( document ).on( 'keydown.inline-preview click.inline-preview', function () {
				if ( ! self.autoClicking ) {
					self.userIsActive = true;
				}
			} );
			
			$( window ).on( 'resize.inline-preview', function ( e ) {
				if ( e.target == window ) {
					clearTimeout( self.resizeTimeout );
				
					self.resizeTimeout = setTimeout( function () {
						self.setContainerWidth();
					}, 250 );
				}
			} );

			self.reloadTimer = setTimeout( function () { self.reload(); }, self.interval );
		},
		
		/**
		 * Set the container width. Happens after a window resize or when the preview frame opens initially.
		 *
		 * @param bool animate Whether this is the initial opening of the preview frame.
		 */
		setContainerWidth : function ( animate ) {
			var self = this;
			
			var previewContainer = $( '#inline-preview-container' );
			
			var windowWidth = $( document ).width();

			if ( animate )
				previewContainer.css( 'left', windowWidth ).show();

			// Editor width in percent.
			var editorWidth = 60;

			if ( localStorage['inline-preview-width'] )
				editorWidth = 100 - localStorage['inline-preview-width'];

			var editorWidthPx = Math.round( windowWidth * ( editorWidth / 100 ) );
			var previewWidthPx = Math.round( windowWidth * ( ( 100 - editorWidth ) / 100 ) );
			
			previewContainer.css( 'width', previewWidthPx );
			
			if ( animate ) {
				this.editorContainer.animate(
					{ 'padding-right' : previewWidthPx },
					{ duration : self.animationDuration, queue : false }
				);
				
				previewContainer.animate(
					{ 'left' : editorWidthPx },
					{ duration : self.animationDuration, queue : false, complete : function () {
						previewContainer
							.append(
								$( '<a id="inline-preview-close"  class="media-modal-close"><span class="media-modal-icon"></span></a>' )
									.on( 'click.inline-preview', function ( e ) {
										e.preventDefault();
										self.remove();
									} )
									.attr( 'title', Inline_Preview_Strings.close )
							)
							.css( 'z-index', '1000' );

						// The editor toolbar only resizes on page scroll.
						$(window).scroll();
					} }
				);
			}
			else {
				this.editorContainer.css( 'padding-right', previewWidthPx );
				previewContainer.css( 'left', editorWidthPx );
			}
		},
		
		/**
		 * Set the timer for the next iframe update.
		 */
		setTimer : function () {
			var self = this;
			
			clearTimeout( this.reloadTimer );
			this.reloadTimer = setTimeout( function () { self.reload(); }, this.interval );
		},

		/**
		 * Reload the preview frame if it's necessary.
		 */
		reload : function () {
			var self = this;

			// Has the user clicked or typed since the last update?
			if ( ! this.userIsActive ) {
				this.setTimer();

				return;
			}

			this.userIsActive = false;

			var loadingFrame = $( '#inline-preview-hidden-iframe' );

			this.autoClicking = true;
			$( '#post-preview' ).click();
			this.autoClicking = false;

			loadingFrame.on( 'load.inline-preview', function () {
				$( this ).off( 'load.inline-preview' );

				// When it loads, scroll to the same position as the visible frame.
				var oldPreviewFrame = $( '#inline-preview-iframe' );
				var iframeScrollLocation = $( oldPreviewFrame.get(0).contentWindow ).scrollTop();
				
				loadingFrame.show();

				$( loadingFrame.get(0).contentWindow ).scrollTop( iframeScrollLocation );

				// Remove the once-visible frame.
				oldPreviewFrame.remove();
				
				var previewIframeName = loadingFrame.attr( 'name' );
				loadingFrame.attr( 'name', '' ).attr( 'id', 'inline-preview-iframe' );
				
				// Give it the right name so that link targets work.
				$( '#inline-preview-container' ).append( $( '<iframe id="inline-preview-hidden-iframe"></iframe>' ).attr( 'name', previewIframeName ) );
				
				self.setTimer();
			} );

			// Set a 15-second backup in case the preview frame fails to load for some reason.
			setTimeout( function() { self.setTimer(); }, 15000 );
		},

		/**
		 * Remove the preview frame and event handlers, as if Preview was never clicked.
		 */
		remove : function () {
			var self = this;

			$( document ).off( '.inline-preview' );
			$( window ).off( '.inline-preview' );

			$( '#inline-preview-close' ).hide();

			$( '#inline-preview-container' )
				.animate(
					{ 'left' : $( window ).width() },
					{ duration : self.animationDuration, queue : false, complete : function () {
						$( '#post-body' ).removeClass( 'columns-1' ).addClass( self.postBodyClass );
						self.postBodyClass = null;

						$( '#inline-preview-container' ).remove();
						$( 'body' ).removeClass( 'inline-preview' );

						// The editor toolbar only resizes on page scroll.
						$(window).scroll();
					} }
				);

			$( '#wpwrap' ).animate(
				{ 'padding-right' : '0' },
				{ duration : self.animationDuration, queue : false }
			);

			clearTimeout( this.reloadTimer );
			clearTimeout( this.resizeTimer );
		},
	};

	inlinePreview.init();
} );