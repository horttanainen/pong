/*
 * app.js
 * 
 */

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
  */

/*global */

//---------------- BEGIN MODULE SCOPE VARIABLES --------------

var
  events  = require( 'events' ),
  net     = require( 'net' ),
  pong    = require( './pong.js' ),
  channel = new events.EventEmitter(),
  
  configMap = {
    graphics : null,
    players : null,
    movement : null
  },
  
  server;


channel.on( 'join', function ( id, socket ) {
  var player;
  
  player = configMap.players.add_player( id, socket );
  configMap.graphics.initialize_map( player );
});

channel.on( 'broadcast', function( senderId, message ) {
  configMap.movement.move( senderId, message );
});

server   = net.createServer( function ( socket ) {
  var id  = socket.remoteAddress + ':' + socket.remotePort,
    buf   = new Buffer(3);

  socket.setEncoding( 'utf8' );

  buf[0] = 255;
  buf[1] = 253;
  buf[2] = 34;

  socket.write( buf );

  buf[0] = 255;
  buf[1] = 251;
  buf[2] = 1;
  socket.write( buf );
  socket.write('\033[?25l' );
  socket.write( '\033[2J' );

  socket.on( 'data', function ( chunk ) {
    
    if ( chunk.length === 1 && chunk.match(/[a-zA-Z]/i) ) {
      channel.emit( 'broadcast', id, chunk );
    }
  });

  channel.emit( 'join', id, socket );
});

//----------------- END MODULE SCOPE VARIABLES ---------------

//------------------- BEGIN SERVER CONFIGURATION ------------------
//-------------------- END SERVER CONFIGURATION -------------------

//--------------------- BEGIN START SERVER --------------------
configMap.graphics  = pong.graphics;
configMap.players   = pong.players;
configMap.movement  = pong.movement;
server.listen( 23 );
//---------------------- END START SERVER ---------------------
