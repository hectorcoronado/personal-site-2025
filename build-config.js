// Build configuration for production minification
export const buildConfig = {
	// Input directories
	input: {
		css: 'public',
		js: 'public',
		html: 'public',
		server: '.',
	},

	// Output directory
	output: 'dist',

	// File patterns
	files: {
		css: ['reset.css', 'style.css', '404.css', 'resume.css'],
		js: ['index.js'],
		html: ['index.html', '404.ejs', 'resume.ejs'],
		server: ['server.js'],
	},

	// Minification options
	minify: {
		css: {
			level: 2, // Aggressive optimization
			format: {
				breaks: false,
				semicolons: false,
			},
		},
		js: {
			compress: {
				drop_console: true, // Remove console.log statements
				drop_debugger: true,
				pure_funcs: ['console.log', 'console.info', 'console.debug'],
			},
			mangle: {
				toplevel: true, // Mangle top-level names
			},
			format: {
				comments: false, // Remove all comments
			},
		},
		html: {
			removeComments: true,
			collapseWhitespace: true,
			removeRedundantAttributes: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			minifyCSS: true,
			minifyJS: true,
		},
	},

	// Critical CSS extraction
	critical: {
		inline: true,
		minify: true,
	},
};
