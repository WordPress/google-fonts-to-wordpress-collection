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
	const filePath = path.join(
		__dirname,
		'releases',
		'gutenberg-' + req.params[ 0 ]
	);
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
