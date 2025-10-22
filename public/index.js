// Contact form submission
document.getElementById('contactForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	const formData = {
		name: document.getElementById('name').value,
		email: document.getElementById('email').value,
		subject: document.getElementById('subject').value,
		message: document.getElementById('message').value,
	};

	const statusDiv = document.getElementById('status');
	statusDiv.textContent = 'Sending...';

	try {
		const response = await fetch('/send-email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});

		const result = await response.json();

		if (response.ok) {
			statusDiv.textContent = 'Message sent successfully!';
			statusDiv.style.color = 'green';
			document.getElementById('contactForm').reset();
		} else {
			statusDiv.textContent = 'Failed to send message. Please try again.';
			statusDiv.style.color = 'red';
		}
	} catch (error) {
		statusDiv.textContent = 'Error sending message.';
		statusDiv.style.color = 'red';
	}
});

// Infinite scroll for the technologies list
document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('scrollContainer');
	const list = document.getElementById('infiniteList');

	// Clone the items for seamless looping
	const items = Array.from(list.children);
	items.forEach((item) => {
		const clone = item.cloneNode(true);
		list.appendChild(clone);
	});

	let isResetting = false;
	let originalWidth;

	// Calculate the width of the original items
	function updateDimensions() {
		originalWidth = list.scrollWidth / 2;
	}

	// Wait a bit for the layout to settle
	setTimeout(() => {
		updateDimensions();

		// Scroll detection
		container.addEventListener('scroll', () => {
			if (isResetting) return;

			const scrollLeft = container.scrollLeft;

			// When reaching the end of duplicated items, jump to start
			if (scrollLeft >= originalWidth) {
				isResetting = true;
				container.scrollLeft = scrollLeft - originalWidth;
				setTimeout(() => {
					isResetting = false;
				}, 0);
			}

			// When scrolling past the beginning, jump to end
			if (scrollLeft <= 0) {
				isResetting = true;
				container.scrollLeft = originalWidth + scrollLeft;
				setTimeout(() => {
					isResetting = false;
				}, 0);
			}
		});

		// Add mouse wheel support for better scrolling
		container.addEventListener('wheel', (e) => {
			e.preventDefault();
			container.scrollLeft += e.deltaY;
		});

		// Add touch support for mobile
		container.addEventListener('touchstart', (e) => {
			container.style.scrollBehavior = 'auto';
		});

		container.addEventListener('touchend', (e) => {
			container.style.scrollBehavior = 'auto';
		});

		// Start at the beginning of the original items
		container.scrollLeft = 0;
	}, 200);
});
