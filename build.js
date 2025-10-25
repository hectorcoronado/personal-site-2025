#!/usr/bin/env node

import { buildConfig } from './build-config.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory and public subdirectory exist
const distDir = path.join(__dirname, buildConfig.output);
const publicDir = path.join(distDir, 'public');
if (!fs.existsSync(distDir)) {
	fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir, { recursive: true });
}

// Main build function
async function build() {
	console.log('🚀 Starting production build...\n');

	// 1. Minify CSS files with cssnano
	console.log('📝 Minifying CSS files...');
	try {
		const cssFiles = buildConfig.files.css;
		const cssnanoConfig = buildConfig.minify.css;

		// Initialize cssnano with advanced preset
		const cssnanoProcessor = cssnano({
			preset: cssnanoConfig.preset,
		});

		for (const file of cssFiles) {
			const sourcePath = path.join(__dirname, buildConfig.input.css, file);
			const destPath = path.join(publicDir, file);

			if (fs.existsSync(sourcePath)) {
				// Read the CSS file
				const cssContent = fs.readFileSync(sourcePath, 'utf8');

				// Minify with cssnano
				const result = await cssnanoProcessor.process(cssContent, {
					from: sourcePath,
					to: destPath,
				});

				// Write minified CSS
				fs.writeFileSync(destPath, result.css);
				console.log(`✅ CSS minified: ${destPath}`);
			}
		}
	} catch (error) {
		console.error('❌ CSS minification failed:', error.message);
	}

	// 2. Minify JavaScript files
	console.log('\n📝 Minifying JavaScript files...');
	try {
		const jsFiles = buildConfig.files.js;
		jsFiles.forEach((file) => {
			const inputPath = path.join(__dirname, buildConfig.input.js, file);
			const outputPath = path.join(publicDir, file.replace('.js', '.min.js'));

			if (fs.existsSync(inputPath)) {
				execSync(`npx terser "${inputPath}" -c -m -o "${outputPath}"`, {
					stdio: 'inherit',
				});
				console.log(`✅ JS minified: ${outputPath}`);
			}
		});
	} catch (error) {
		console.error('❌ JavaScript minification failed:', error.message);
	}

	// 3. Minify server.js
	console.log('\n📝 Minifying server.js...');
	try {
		const serverInput = path.join(__dirname, 'server.js');
		const serverOutput = path.join(distDir, 'server.min.js');

		if (fs.existsSync(serverInput)) {
			execSync(`npx terser "${serverInput}" -c -m -o "${serverOutput}"`, {
				stdio: 'inherit',
			});
			console.log(`✅ Server minified: ${serverOutput}`);
		}
	} catch (error) {
		console.error('❌ Server minification failed:', error.message);
	}

	// 4. Create production HTML templates
	console.log('\n📝 Creating production HTML templates...');
	try {
		execSync('node build-templates.js', { stdio: 'inherit' });
		console.log('✅ Production HTML templates created');
	} catch (error) {
		console.error('❌ HTML template creation failed:', error.message);
	}

	// 5. Copy assets and static files to public directory
	console.log('\n📁 Copying assets and static files...');
	try {
		// Copy assets to dist/public/assets
		const assetsSource = path.join(__dirname, 'public', 'assets');
		const assetsDest = path.join(publicDir, 'assets');

		if (fs.existsSync(assetsSource)) {
			execSync(`cp -r "${assetsSource}" "${assetsDest}"`, {
				stdio: 'inherit',
			});
			console.log('✅ Assets copied to public/assets');
		}

		// Copy manifest.json to dist/public directory
		const manifestSource = path.join(__dirname, 'public', 'manifest.json');
		const manifestDest = path.join(publicDir, 'manifest.json');
		if (fs.existsSync(manifestSource)) {
			fs.copyFileSync(manifestSource, manifestDest);
			console.log('✅ Manifest.json copied to public directory');
		}

		// Copy sitemap.xml to dist/public directory
		const sitemapSource = path.join(__dirname, 'sitemap.xml');
		const sitemapDest = path.join(publicDir, 'sitemap.xml');
		if (fs.existsSync(sitemapSource)) {
			fs.copyFileSync(sitemapSource, sitemapDest);
			console.log('✅ Sitemap.xml copied to public directory');
		}
	} catch (error) {
		console.error('❌ Asset copying failed:', error.message);
	}

	// 6. Create production package.json
	console.log('\n📦 Creating production package.json...');
	try {
		const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

		// Remove devDependencies and scripts not needed in production
		const prodPackage = {
			...packageJson,
			scripts: {
				start: 'node server.min.js',
				'start:prod': 'node server.min.js',
			},
			devDependencies: undefined,
			nodemonConfig: undefined,
		};

		fs.writeFileSync(
			path.join(distDir, 'package.json'),
			JSON.stringify(prodPackage, null, 2)
		);

		console.log('✅ Production package.json created');
	} catch (error) {
		console.error('❌ Package.json creation failed:', error.message);
	}

	console.log('\n🎉 Production build completed successfully!');
	console.log(`📁 Output directory: ${distDir}`);
	console.log('\n📊 Build summary:');
	console.log('- CSS: Minified with cssnano (advanced preset) → dist/public/');
	console.log('- JavaScript: Minified with Terser → dist/public/');
	console.log('- Server: Minified with Terser → dist/');
	console.log('- HTML: Templates created → dist/public/');
	console.log('- Assets: Copied → dist/public/assets/');
}

// Run the build
build().catch(console.error);
