/**
 * jquery.mainmenu.js v1.0.1
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {

	'use strict';

	// global
	var Modernizr = window.Modernizr, $body = $( 'body' );

	$.mainMenu = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};

	// the options
	$.mainMenu.defaults = {
		// classes for the animation effects
		animationClasses : { classin : 'main-animate-in-1', classout : 'main-animate-out-1' },
		// callback: click a link that has a sub menu
		// el is the link element (li); name is the level name
		onLevelClick : function( el, name ) { return false; },
		// callback: click a link that does not have a sub menu
		// el is the link element (li); ev is the event obj
		onLinkClick : function( el, ev ) { return false; }
	};

	$.mainMenu.prototype = {
		_init : function( options ) {

			// options
			this.options = $.extend( true, {}, $.mainMenu.defaults, options );
			// cache some elements and initialize some variables
			this._config();
			
			var animEndEventNames = {
					'WebkitAnimation' : 'webkitAnimationEnd',
					'OAnimation' : 'oAnimationEnd',
					'msAnimation' : 'MSAnimationEnd',
					'animation' : 'animationend'
				},
				transEndEventNames = {
					'WebkitTransition' : 'webkitTransitionEnd',
					'MozTransition' : 'transitionend',
					'OTransition' : 'oTransitionEnd',
					'msTransition' : 'MSTransitionEnd',
					'transition' : 'transitionend'
				};
			// animation end event name
			this.animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ] + '.mainmenu';
			// transition end event name
			this.transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ] + '.mainmenu',
			// support for css animations and css transitions
			this.supportAnimations = Modernizr.cssanimations,
			this.supportTransitions = Modernizr.csstransitions;

			this._initEvents();

		},
		_config : function() {
			this.open = false;
			this.$trigger = this.$el.children( '.main-trigger' );
			this.$menu = this.$el.children( 'ul.main-menu' );
			this.$menuitems = this.$menu.find( 'li:not(.main-back)' );
			this.$el.find( 'ul.main-submenu' ).prepend( '<li class="main-back"><a href="#">back</a></li>' );
			this.$back = this.$menu.find( 'li.main-back' );
		},
		_initEvents : function() {

			var self = this;

			this.$trigger.on( 'click.mainmenu', function() {
				
				if( self.open ) {
					self._closeMenu();
				} 
				else {
					self._openMenu();
				}
				return false;

			} );

			this.$menuitems.on( 'click.mainmenu', function( event ) {
				
				event.stopPropagation();

				var $item = $(this),
					$submenu = $item.children( 'ul.main-submenu' );

				if( $submenu.length > 0 ) {

					var $flyin = $submenu.clone().css( 'opacity', 0 ).insertAfter( self.$menu ),
						onAnimationEndFn = function() {
							self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classout ).addClass( 'main-subview' );
							$item.addClass( 'main-subviewopen' ).parents( '.main-subviewopen:first' ).removeClass( 'main-subviewopen' ).addClass( 'main-subview' );
							$flyin.remove();
						};

					setTimeout( function() {
						$flyin.addClass( self.options.animationClasses.classin );
						self.$menu.addClass( self.options.animationClasses.classout );
						if( self.supportAnimations ) {
							self.$menu.on( self.animEndEventName, onAnimationEndFn );
						}
						else {
							onAnimationEndFn.call();
						}

						self.options.onLevelClick( $item, $item.children( 'a:first' ).text() );
					} );

					return false;

				}
				else {
					self.options.onLinkClick( $item, event );
				}

			} );

			this.$back.on( 'click.mainmenu', function( event ) {
				
				var $this = $( this ),
					$submenu = $this.parents( 'ul.main-submenu:first' ),
					$item = $submenu.parent(),

					$flyin = $submenu.clone().insertAfter( self.$menu );

				var onAnimationEndFn = function() {
					self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classin );
					$flyin.remove();
				};

				setTimeout( function() {
					$flyin.addClass( self.options.animationClasses.classout );
					self.$menu.addClass( self.options.animationClasses.classin );
					if( self.supportAnimations ) {
						self.$menu.on( self.animEndEventName, onAnimationEndFn );
					}
					else {
						onAnimationEndFn.call();
					}

					$item.removeClass( 'main-subviewopen' );
					
					var $subview = $this.parents( '.main-subview:first' );
					if( $subview.is( 'li' ) ) {
						$subview.addClass( 'main-subviewopen' );
					}
					$subview.removeClass( 'main-subview' );
				} );

				return false;

			} );
			
		},
		closeMenu : function() {
			if( this.open ) {
				this._closeMenu();
			}
		},
		_closeMenu : function() {
			var self = this,
				onTransitionEndFn = function() {
					self.$menu.off( self.transEndEventName );
					self._resetMenu();
				};
			
			this.$menu.removeClass( 'main-menuopen' );
			this.$menu.addClass( 'main-menu-toggle' );
			this.$trigger.removeClass( 'main-active' );
			
			if( this.supportTransitions ) {
				this.$menu.on( this.transEndEventName, onTransitionEndFn );
			}
			else {
				onTransitionEndFn.call();
			}

			this.open = false;
		},
		openMenu : function() {
			if( !this.open ) {
				this._openMenu();
			}
		},
		_openMenu : function() {
			var self = this;
			// clicking somewhere else makes the menu close
			$body.off( 'click' ).on( 'click.mainmenu', function() {
				self._closeMenu() ;
			} );
			this.$menu.addClass( 'main-menuopen main-menu-toggle' ).on( this.transEndEventName, function() {
				$( this ).removeClass( 'main-menu-toggle' );
			} );
			this.$trigger.addClass( 'main-active' );
			this.open = true;
		},
		// resets the menu to its original state (first level of options)
		_resetMenu : function() {
			this.$menu.removeClass( 'main-subview' );
			this.$menuitems.removeClass( 'main-subview main-subviewopen' );
		}
	};

	var logError = function( message ) {
		if ( window.console ) {
			window.console.error( message );
		}
	};

	$.fn.mainmenu = function( options ) {
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				var instance = $.data( this, 'mainmenu' );
				if ( !instance ) {
					logError( "cannot call methods on mainmenu prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for mainmenu instance" );
					return;
				}
				instance[ options ].apply( instance, args );
			});
		} 
		else {
			this.each(function() {	
				var instance = $.data( this, 'mainmenu' );
				if ( instance ) {
					instance._init();
				}
				else {
					instance = $.data( this, 'mainmenu', new $.mainMenu( options, this ) );
				}
			});
		}
		return this;
	};

} )( jQuery, window );