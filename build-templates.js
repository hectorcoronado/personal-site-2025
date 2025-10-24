#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create production-optimized HTML template
 * @param {string} inputFile - Source file path (e.g., 'index.html', '404.ejs')
 * @param {string} outputFile - Output file path (e.g., 'index.html', '404.ejs')
 * @param {Object} replacements - Object containing CSS and JS replacements
 * @param {string} replacements.css - CSS file to replace (e.g., 'style.css', '404.css')
 * @param {string} replacements.js - JS file to replace (optional, e.g., 'index.js')
 */
function createProductionTemplate(inputFile, outputFile, replacements = {}) {
	const distDir = path.join(__dirname, 'dist');
	const inputPath = path.join(__dirname, 'public', inputFile);

	// Read the original file
	const originalContent = fs.readFileSync(inputPath, 'utf8');

	// Create production version with replacements
	let productionContent = originalContent
		.replace('href="reset.css"', '') // Remove reset.css (included in combined CSS)
		.replace(/\s+/g, ' ') // Remove extra whitespace
		.trim();

	// Apply CSS replacement
	if (replacements.css) {
		productionContent = productionContent.replace(
			`href="${replacements.css}"`,
			'href="styles.min.css"'
		);
	}

	// Apply JS replacement
	if (replacements.js) {
		productionContent = productionContent.replace(
			`src="${replacements.js}"`,
			`src="${replacements.js.replace('.js', '.min.js')}"`
		);
	}

	// Write the production file
	fs.writeFileSync(path.join(distDir, outputFile), productionContent);
	console.log(`✅ Production ${outputFile} template created`);
}

// Template configurations
const templates = [
	{
		input: 'index.html',
		output: 'index.html',
		replacements: {
			css: 'style.css',
			js: 'index.js',
		},
	},
	{
		input: '404.ejs',
		output: '404.ejs',
		replacements: {
			css: '404.css',
		},
	},
	{
		input: 'resume.ejs',
		output: 'resume.ejs',
		replacements: {
			css: 'resume.css',
		},
	},
];

// Run the template creation
console.log('📝 Creating production HTML templates...');
templates.forEach((template) => {
	createProductionTemplate(
		template.input,
		template.output,
		template.replacements
	);
});
console.log('✅ All production templates created');
