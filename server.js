import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import xssFilters from 'xss-filters';
import fs from 'fs';
import { marked } from 'marked';

dotenv.config();

const app = express();
app.set('trust proxy', 1 /* number of proxies between user and server */);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './public');

// CSP (content security policy) to prevent xss attacks (along with xss-filters)
app.use((req, res, next) => {
	res.setHeader(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'"
	);
	next();
});

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// Verify transporter configuration
transporter.verify((error, success) => {
	if (error) {
		console.log('Error with email configuration:', error);
	} else {
		console.log('Server is ready to send emails 💌');
	}
});

// Rate limiting, 5 requests per 15 minutes per IP
const emailLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
});

app.use('/send-email', emailLimiter);

// Handle form submission
app.post('/send-email', async (req, res) => {
	let { name, email, subject, message } = req.body;
	// Sanitize inputs to prevent xss attacks (along with CSP)
	name = xssFilters.inHTMLData(name);
	email = xssFilters.inHTMLData(email);
	subject = xssFilters.inHTMLData(subject);
	message = xssFilters.inHTMLData(message);

	// Validate input, frontend validation should prevent this
	if (!name || !email || !subject || !message) {
		return res.status(400).json({ error: 'All fields are required' });
	}

	// Email options
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: process.env.EMAIL_USER, // Send to yourself
		replyTo: email, // User's email for easy reply
		subject: `Contact Form: ${subject}`,
		html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: 'Email sent successfully' });
	} catch (error) {
		console.error('Error sending email:', error);
		res.status(500).json({ error: 'Failed to send email' });
	}
});

const resumeLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 5, // limit each IP to 5 requests per windowMs
});

app.use('/resume', resumeLimiter);

app.get('/resume', (req, res) => {
	const filePath = 'public/assets/resume.md';

	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			return res.status(404).send('Markdown file not found');
		}

		const htmlContent = marked.parse(data);
		res.render('resume', { content: htmlContent });
	});
});

app.get('/ip', (request, response) => {
	response.send(request.ip);
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT} 🚀`);
});
