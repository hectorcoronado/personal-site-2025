#!/usr/bin/env node

import { buildConfig } from './build-config.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CleanCSS from 'clean-css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
const distDir = path.join(__dirname, buildConfig.output);
if (!fs.existsSync(distDir)) {
	fs.mkdirSync(distDir, { recursive: true });
}

console.log('🚀 Starting production build...\n');

// 1. Minify CSS files
console.log('📝 Minifying CSS files...');
try {
	const cssFiles = buildConfig.files.css;
	const cssOutput = path.join(distDir, 'styles.min.css');

	// Combine all CSS files into one
	let combinedCSS = '';
	cssFiles.forEach((file) => {
		const filePath = path.join(__dirname, buildConfig.input.css, file);
		if (fs.existsSync(filePath)) {
			combinedCSS += fs.readFileSync(filePath, 'utf8') + '\n';
		}
	});

	// Simple CSS minification (remove comments, extra whitespace, etc.)
	let minifiedCSS = combinedCSS
		.replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
		.replace(/\s+/g, ' ') // Replace multiple spaces with single space
		.replace(/\s*{\s*/g, '{') // Remove spaces around braces
		.replace(/;\s*/g, ';') // Remove spaces after semicolons
		.replace(/\s*}\s*/g, '}') // Remove spaces around closing braces
		.replace(/\s*,\s*/g, ',') // Remove spaces around commas
		.replace(/\s*:\s*/g, ':') // Remove spaces around colons
		.replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
		.trim();

	fs.writeFileSync(cssOutput, minifiedCSS);
	console.log(`✅ CSS minified: ${cssOutput}`);
} catch (error) {
	console.error('❌ CSS minification failed:', error.message);
}

// 2. Minify JavaScript files
console.log('\n📝 Minifying JavaScript files...');
try {
	const jsFiles = buildConfig.files.js;
	jsFiles.forEach((file) => {
		const inputPath = path.join(__dirname, buildConfig.input.js, file);
		const outputPath = path.join(distDir, file.replace('.js', '.min.js'));

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

// 5. Create public directory structure and copy assets
console.log('\n📁 Creating public directory structure...');
try {
	// Create public directory in dist
	const publicDir = path.join(distDir, 'public');
	if (!fs.existsSync(publicDir)) {
		fs.mkdirSync(publicDir, { recursive: true });
	}

	// Copy assets to public/assets
	const assetsSource = path.join(__dirname, 'public', 'assets');
	const assetsDest = path.join(publicDir, 'assets');

	if (fs.existsSync(assetsSource)) {
		execSync(`cp -r "${assetsSource}" "${assetsDest}"`, {
			stdio: 'inherit',
		});
		console.log('✅ Assets copied to public/assets');
	}

	// Copy HTML and EJS templates to public directory
	const templateFiles = ['index.html', '404.ejs', 'resume.ejs'];
	templateFiles.forEach((file) => {
		const sourcePath = path.join(distDir, file);
		const destPath = path.join(publicDir, file);
		if (fs.existsSync(sourcePath)) {
			fs.copyFileSync(sourcePath, destPath);
			fs.unlinkSync(sourcePath); // Remove from root dist directory
		}
	});
	console.log('✅ Templates moved to public directory');
} catch (error) {
	console.error('❌ Public directory creation failed:', error.message);
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

// 7. Copy environment file if it exists
console.log('\n🔐 Copying environment files...');
try {
	if (fs.existsSync('.env')) {
		fs.copyFileSync('.env', path.join(distDir, '.env'));
		console.log('✅ Environment file copied');
	}
} catch (error) {
	console.log(
		'⚠️  No .env file found (this is normal if using environment variables)'
	);
}

console.log('\n🎉 Production build completed successfully!');
console.log(`📁 Output directory: ${distDir}`);
console.log('\n📊 Build summary:');
console.log('- CSS: Combined and minified into styles.min.css');
console.log('- JavaScript: Minified with Terser');
console.log('- Server: Minified with Terser');
console.log('- HTML: Minified with html-minifier-terser');
console.log('- Assets: Copied to dist/assets/');
