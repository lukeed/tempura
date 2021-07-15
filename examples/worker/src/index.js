// NOTE: Must be built!
// $ npm run esbuild
// OR
// $ npm run rollup
import Tasks from './todos.hbs';

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handle(request) {
	let items = [];

	try {
		// Make external HTTP request for JSON data.
		// NOTE: Data could come from Workers KV, for example.
		let res = await fetch('https://jsonplaceholder.typicode.com/todos');
		items = await res.json();
	} catch (err) {
		return new Response('Error fetching JSON data', {
			status: 500
		});
	}

	// Invoke the `Tasks` renderer, which
	// is a `function` after build injection.
	let html = Tasks({ items });

	return new Response(html, {
		status: 200,
		headers: {
			'Content-Type': 'text/html;charset=utf8'
		}
	});
}

// Initialize/Attach Worker
addEventListener('fetch', event => {
	event.respondWith(
		handle(event.request)
	);
});
