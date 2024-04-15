const express = require( 'express' );
const fs = require( 'fs' );
const http = require( 'http' );
const morgan = require( 'morgan' );
const util = require( 'util' );
const path = require( 'path' );
const stream = require( 'stream' );
const pipeline = util.promisify( stream.pipeline );
const app = express();

// Use morgan middleware for logging
app.use( morgan( 'combined' ) );

app.get( '/images/fonts/*', async ( req, res ) => {
	// Serve font collections from the local filesystem at the same url paths as s.w.org for both WP and Gutenberg releases:
	// e.g. /images/fonts/wp-6.5/... and /images/fonts/17.7/...
	const subdir = req.url.includes( '/wp-' ) ? '' : 'gutenberg-';
	const filePath = path.join(
		__dirname,
		'releases',
		subdir + req.params[ 0 ]
	);

	// Rewrite font preview URLs in the collection JSON to use the development server
	if ( path.extname( filePath ) === '.json' ) {
		const readStream = fs.createReadStream( filePath, {
			encoding: 'utf8',
		} );

		const transformStream = new stream.Transform( {
			transform( chunk, encoding, callback ) {
				this.push(
					chunk
						.toString()
						.replaceAll(
							'https://s.w.org/images/fonts',
							'http://localhost:9158/images/fonts'
						)
				);
				callback();
			},
		} );

		readStream.on( 'error', ( err ) => {
			res.status( 404 ).send( `File not found: ${ filePath }` );
		} );

		res.setHeader( 'Content-Type', 'application/json' );
		await pipeline( readStream, transformStream, res );
	} else {
		res.sendFile( filePath, ( err ) => {
			if ( err ) {
				res.status( 404 ).send( `File not found: ${ filePath }` );
			}
		} );
	}
} );

http.createServer( app ).listen( 9158, () => {
	console.log( 'HTTP Server running at http://localhost:9158' );
} );
