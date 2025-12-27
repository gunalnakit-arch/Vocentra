/**
 * Fetch file content from Gemini File API
 */
export async function fetchFileContent(fileUri: string, apiKey: string): Promise<string> {
    try {
        // Extract file name from URI (format: files/{name})
        const fileName = fileUri.split('/').pop();

        if (!fileName) {
            throw new Error('Invalid file URI');
        }

        // Fetch file metadata from Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const fileData = await response.json();

        // Note: Gemini File API doesn't provide direct content download
        // We return metadata as a string representation
        return `File: ${fileData.name}\nURI: ${fileData.uri}\nState: ${fileData.state}`;

    } catch (error) {
        console.error('Error fetching file content:', error);
        return '';
    }
}

/**
 * Create context message from file URIs
 * This will be sent as the first message to provide context
 */
export function createFileContextMessage(fileUris: string[]): string {
    if (fileUris.length === 0) return '';

    return `[KNOWLEDGE BASE CONTEXT]
You have access to ${fileUris.length} file(s) in your knowledge base:
${fileUris.map((uri, i) => `${i + 1}. ${uri}`).join('\n')}

IMPORTANT: Use ONLY the information from these files to answer questions. Do not use your general knowledge.`;
}
