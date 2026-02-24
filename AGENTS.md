# AGENTS.md

This repo contains Node scripts to generate the Google Fonts collection JSON files and associated font previews for the WordPress Font Library.

The generated JSON files are deployed to the w.org CDN and consumed by the Font Library in WordPress and the Gutenberg plugin.

Here are examples of the JSON files these scripts generate:

<https://s.w.org/images/fonts/17.7/collections/google-fonts.json>
<https://s.w.org/images/fonts/17.7/collections/google-fonts-with-preview.json>

See README.md for more details.

## Tech Stack

-   Node
-   Google Fonts API
-   WordPress

## Directory Structure

-   `src/`: Contains the Node scripts to generate the Google Fonts collection JSON files and associated font previews.
-   `releases/`: Contains the generated JSON files.
-   `previews/`: Contains the generated font previews.
-   `font-assets/`: Contains the downloaded font assets.
-   `development-server.js`: Contains the development server code.
-   `README.md`: Contains the README file.
-   `LICENSE`: Contains the license file.
-   `package.json`: Contains the package dependencies.
-   `package-lock.json`: Contains the package lock file.

## Commands

```bash
# Fetch Google Fonts data and generate the Google Fonts collection JSON files
npm run api

# Download the font assets
npm run files

# Generate the font previews
npm run previews

# Format the JSON files
npm run format

# Lint the code
npm run lint

# Update the package dependencies
npm run packages-update

# Start the development server
npm run serve
```

For more details on how to use these commands, see README.md.

## Conventions to Follow

- Use the WordPress coding standards.

## Common Pitfalls

- The `npm run api` command requires a Google Fonts API key. See README.md for more details.
- You must follow specific steps to create a new version of the font collection. See the "Creating a new version of the font collection" section of README.md for more details.
