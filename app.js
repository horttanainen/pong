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
    graphics  : null,
    players   : null,
    movement  : null,
    game      : null
  },
  
  server;


channel.on( 'join', function ( id, socket ) {
  configMap.players.add_player( id, socket );
  configMap.game.init_telnet_game( socket );
  configMap.graphics.init_map( id );
});

channel.on( 'broadcast', function( senderId, message ) {
  configMap.movement.move( senderId, message );
});

server   = net.createServer( function ( socket ) {
  var id  = socket.remoteAddress + ':' + socket.remotePort;

  socket.setEncoding( 'utf8' );

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
configMap.game      = pong.game;
server.listen( 23 );
//---------------------- END START SERVER ---------------------
