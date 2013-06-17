jQuery( function ( $ ) {
	var inlinePreview = {
		animationDuration : 500,
		interval : 3000,
		userIsActive : false,
		timer : null,

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
		 * The user has intiated a preview.
		 */
		preview : function () {
			var self = this;
			
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

			var previewContainer = $( '<div id="inline-preview-container"><iframe name="wp-preview" id="inline-preview-iframe""></iframe></div>' ).css( 'width', previewWidthPx ).css( 'left', windowWidth );

			if ( $( '#post-body' ).hasClass( 'columns-2' ) ) {
				self.postBodyClass = 'columns-2';
				$( '#post-body' ).removeClass( 'columns-2' ).addClass( 'columns-1' );
			}
			else {
				self.postBodyClass = 'columns-1';
			}

			self.editorContainer
				.before( previewContainer )
				.animate(
					{ 'padding-right' : previewWidthPx },
					{ duration : self.animationDuration, queue : false }
				);

			previewContainer
				.addClass( 'loading' )
				.animate(
					{ 'left' : editorWidthPx },
					{ duration : self.animationDuration, queue : false, complete : function () {
						previewContainer
							.append(
								$( '<a id="inline-preview-close">X</a>' )
									.on( 'click.inline-preview', function ( e ) {
										e.preventDefault();
										self.remove();
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
				$( this ).unbind( 'load.inline-preview' ).removeAttr( 'name' );
				$( '#inline-preview-container' ).append( $( '<iframe name="wp-preview" id="inline-preview-hidden-iframe"></iframe>' ) );
			} );

			// Don't continually refresh the iframe if nothing is happening.
			$( document ).on( 'keydown.inline-preview click.inline-preview', function () {
				self.userIsActive = true;
			} );

			self.timer = setTimeout( function () { self.reload(); }, self.interval );
		},
		
		/**
		 * Set the timer for the next iframe update.
		 */
		setTimer : function () {
			var self = this;
			
			clearTimeout( this.timer );
			this.timer = setTimeout( function () { self.reload(); }, this.interval );
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

			var hiddenFrame = $( '#inline-preview-hidden-iframe' );

			$( '#post-preview' ).click();

			hiddenFrame.on( 'load.inline-preview', function () {
				$( this ).off( 'load.inline-preview' );

				var visibleFrame = $( '#inline-preview-iframe' );
				var visibleFrameWindow = $( visibleFrame.get(0).contentWindow );
				var iframeScrollLocation = visibleFrameWindow.scrollTop();

				try {
					visibleFrame.contents().find( 'body' ).html( hiddenFrame.contents().find( 'body' ).html() );
				} catch ( e ) {
					// Not 100% sure why this errors, but probably due to JS re-execution when the body contents change.
					// console.log(e);
				}

				visibleFrameWindow.scrollTop( iframeScrollLocation );
				self.setTimer();
			} );
		},

		/**
		 * Remove the preview frame and event handlers, as if Preview was never clicked.
		 */
		remove : function () {
			var self = this;

			$( document ).off( '.inline-preview' );

			$( '#inline-preview-close' ).hide();

			$( '#inline-preview-container' )
				.animate(
					{ 'left' : $( window ).width() },
					{ duration : self.animationDuration, queue : false, complete : function () {
						$( '#post-body' ).removeClass( 'columns-1' ).addClass( self.postBodyClass );
						self.postBodyClass = null;

						$( '#inline-preview-container' ).remove();
						$( 'body' ).removeClass( 'inline-preview' );
					} }
				);

			$( '#wpwrap' ).animate(
				{ 'padding-right' : '0' },
				{ duration : self.animationDuration, queue : false }
			);

			clearTimeout( this.timer );
		},
	};

	inlinePreview.init();
} );