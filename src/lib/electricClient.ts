import { ShapeStream, Shape } from '@electric-sql/client';

// Initialize ShapeStream
const stream = new ShapeStream({
	url: 'http://localhost:3000/v1/shape/yourShapeName' // Replace with your actual shape URL
});

// Initialize Shape
const shape = new Shape(stream);

// Function to get the latest shape data
export async function getShapeData() {
	return await shape.value;
}
