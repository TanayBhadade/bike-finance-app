# Bike Finance Frontend Application

This is the frontend for the Bike Finance application, built with React.

## Running the Application

### Correct Way to Run the Application

React applications with JSX syntax cannot be run directly with Node.js. Instead, you should use the npm start command to start the React development server:

```bash
npm start
```

This command will:
1. Start the React development server
2. Compile and transpile the JSX code into JavaScript
3. Open the application in your default web browser
4. Enable hot reloading for development

Alternatively, you can use the provided `run.bat` file which will execute the same command.

### Common Errors

If you try to run a React component file directly with Node.js, like this:

```bash
node src/App.js
```

You will get an error like:

```
SyntaxError: Unexpected token '<'
```

This happens because Node.js cannot interpret JSX syntax (the HTML-like syntax in React components) directly. JSX needs to be transpiled to JavaScript first, which is what the React development server does when you run `npm start`.

## Development Workflow

1. Make changes to the code
2. The development server will automatically reload with your changes
3. When ready to deploy, build the application with:

```bash
npm run build
```

This will create a production-ready build in the `build` folder.

## API Connection

This frontend connects to the backend API running on http://localhost:3000. Make sure the backend server is running before using the application.