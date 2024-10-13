// data.js



// To specify the correct answers, you need to indicate the index of the correct options for each question.
export const answers = [0,0,0,0,0];



// Import the 'fs/promises' module for promise-based file system operations
import { readFile } from 'fs/promises';

// Specify the path to your text file
const filePath = './database/joelearn.quiz'; // Change this to your file path

// Function to read the file and export its contents
export async function readFileContents() {
    try {
        // Read the file
        const data = await readFile(filePath, 'utf8');
        // Return the contents of the file
        return data;
    } catch (err) {
        console.error('Error reading the file:', err);
        throw err; // Rethrow the error if needed
    }
}

// Export a test object with the file contents
export const quiz = await readFileContents();
console.log(quiz)