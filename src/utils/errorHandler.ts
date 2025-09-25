import axios from 'axios';

interface ErrorInfo {
  userMessage: string;
  developerMessage: string;
}

/**
 * Parses an error object, extracts relevant information, 
 * and returns a user-friendly message and a detailed developer log.
 * @param error The error object to handle (typically from a catch block).
 * @param context A string describing where the error occurred (e.g., 'loading blog post').
 * @returns An object containing a user-friendly message and a detailed developer log.
 */
export const handleApiError = (error: any, context: string = 'an API request'): ErrorInfo => {
  let userMessage = `An unexpected error occurred while ${context}. Please try again.`;
  let developerMessage = `[API Error Context: ${context}] `; 

  if (axios.isAxiosError(error)) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data, config } = error.response;
      const apiPath = `${config.method?.toUpperCase()} ${config.url}`;
      const serverMessage = data.message || 'No additional error message from server.';

      developerMessage += `🛑 ${status} on ${apiPath} | Server Message: "${serverMessage}"`;

      switch (status) {
        case 400:
          userMessage = `There was a problem with your request. ${serverMessage}`;
          break;
        case 401:
          userMessage = 'Authentication failed. Please log in again.';
          break;
        case 403:
          userMessage = "You don't have permission to perform this action.";
          break;
        case 404:
          userMessage = "The requested resource could not be found.";
          break;
        case 500:
          userMessage = 'A server error occurred. Our team has been notified. Please try again later.';
          break;
        default:
          userMessage = `An error occurred (Code: ${status}). Please try again.`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      developerMessage += '🌐 Network Error: No response received from server. This could be a CORS issue, a network outage, or the server is down.';
      userMessage = 'Could not connect to the server. Please check your network connection and try again.';
    } else {
      // Something happened in setting up the request that triggered an Error
      developerMessage += `🔥 Request Setup Error: ${error.message}`;
      userMessage = 'An unexpected error occurred before the request could be sent.';
    }
  } else {
    // Non-Axios error
    developerMessage += `Non-API Error: ${error.message}`;
    if (error.stack) {
        developerMessage += `\nStack: ${error.stack}`;
    }
  }

  // Log the detailed message for developers
  console.error(developerMessage);

  return { userMessage, developerMessage };
};
