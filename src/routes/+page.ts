export const load = async () => {
	// You can perform any necessary server-side data fetching here
	// For example, fetching initial data or configuration

	return {
		// Return any data needed for initial render
		shapeOptions: {
			url: 'http://localhost:3000/v1/shape/items' // Replace with your actual shape URL
		}
	};
};
