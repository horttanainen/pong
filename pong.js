/*
 * pong.js
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
  graphics,
  players,
  movement,
  configMap = {
    map_height  : 24,
    map_width   : 80,
    pad_height  : 4,
    map_floor       : ' ',
    map_border_tile : '=',
    pad_tile        : '+',
    ball_tile       : 'o',
    player_one      : 0,
    player_two      : 1
  },
  stateMap = {
  },
  initModule;

//----------------- END MODULE SCOPE VARIABLES ---------------
//---------------- BEGIN PUBLIC METHODS ----------------------
movement = ( function () {
  var
    move;

  move = function ( senderId, command ) {
    var
    new_move, index,
           player_list;

  player_list = players.get_players();

  new_move = graphics.make_paddle( player_list[ senderId ].player_no, 5 );

  for ( index in player_list ) {
    if ( player_list.hasOwnProperty( index ) ) {
      player_list[ index ].socket.write( new_move );
    }
  }
  };

  return {
    move : move
  };

}());

players = ( function () {
  var
    player_number = 0,
    create_player,
    add_player,
    get_players,
    curr_players = {},
    
    player = {
      map_received  : false
    };

    create_player = function ( id, socket) {
      var new_player;
      
      new_player = Object.create( player );
      new_player.id         = id;
      new_player.socket     = socket;
      new_player.player_no  = player_number++;

      return new_player;
    };

    add_player = function ( id, socket ) {
      curr_players[ id ] = create_player( id, socket );
      return curr_players[ id ];
   };

   get_players = function () {
     return curr_players;
   };

    return {
      add_player : add_player,
      get_players    : get_players
    };
}());

graphics = ( function () {
  var
    make_map, get_map, make_paddle,
    append_start_position_paddle,
    append_reset_cursor_position,
    initialize_map,
    map;

make_map = function () {
  var map_string  = '',
    h, w;
  for ( h = 1; h <= configMap.map_height; h++) {
    for ( w = 1; w <= configMap.map_width; w++) {
      if ( h === 1 ) {
        map_string += configMap.map_border_tile;
      }
      else if ( h === configMap.map_height ) {
        map_string += configMap.map_border_tile;
      }
      else if ( w === configMap.map_width) {
        map_string += '\n';
      }
      else {
        map_string += configMap.map_floor;
      }
    }
  }
  map = map_string;
};

get_map = function () {
  if ( ! map ) {
    make_map();
    return map;
  }
    return map;
};

initialize_map = function ( user ) {
    user.socket.write( '\033[2K\b' );
    user.socket.write( get_map() );
    if ( user.player_no === 0 ) {
      user.socket.write( '\033[12;0f' );
    }
    else {
      user.socket.write( '\033[12;79f' );
    }
};

append_reset_cursor_position = function ( player_no ) { 
    if ( player_no === configMap.player_one ) {
      return '\033[12;1f';
    }
    if ( player_no === configMap.player_two ) {
      return '\033[12;80f';
    }
};

append_start_position_paddle = function ( player_no ) {
    if ( player_no === configMap.player_one ) {
      return '\033[2;1f';
    }
    if ( player_no === configMap.player_two ) {
      return '\033[2;80f';
    }
};

make_paddle = function ( player_no, position ) {
  var paddle_string = '',
    map_height_minus_pad = configMap.map_height - configMap.pad_height - 1,
    i, j;

    paddle_string += append_start_position_paddle( player_no );

    for ( i = 0; i < map_height_minus_pad; i++ ) {
      if ( i === position ) {
        for ( j = 0; j < configMap.pad_height; j++ ) {
          paddle_string += configMap.pad_tile + '\b\033[B';
        }
      }
      else {
        paddle_string += configMap.map_floor + '\b\033[B';
      }
    }

    paddle_string += append_reset_cursor_position( player_no );
    
    return paddle_string; 
};

return {
  get_map : get_map,
  make_paddle : make_paddle,
  initialize_map : initialize_map
};

}());

//---------------- END PUBLIC METHODS ------------------------
//---------------- BEGIN MODULE INITILIZATION ----------------
//initModule = function () {};
//---------------- END MODULE INITILIZATION ------------------

module.exports = {
  graphics : graphics,
  players  : players,
  movement : movement
};
