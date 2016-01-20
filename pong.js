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
  game,
  configMap = {
    map_height  : 24,
    map_width   : 80,
    pad_height  : 4,
    map_floor       : '#',
    map_border_tile : '=',
    pad_tile        : '+',
    ball_tile       : 'o',
    player_one      : 0,
    player_two      : 1,
    move_up         : 'w',
    move_down       : 's'
  },
  stateMap = {
  },
  initModule;

//----------------- END MODULE SCOPE VARIABLES ---------------
//---------------- BEGIN PUBLIC METHODS ----------------------
game = ( function () {
  var init_telnet_game;

  init_telnet_game = function ( socket ) {
  var buf   = new Buffer(6);
  buf[0] = 255;
  buf[1] = 253;
  buf[2] = 34;
  buf[3] = 255;
  buf[4] = 251;
  buf[5] = 1;
  socket.write( buf );
  socket.write('\033[?25l' );
  socket.write( '\033[2J' );
  };

  return {
    init_telnet_game : init_telnet_game
  };
}());
movement = ( function () {
  var
  move, move_up, make_the_move,
  move_down;

  make_the_move = function ( move, curr_players ) {
    var index;
    for ( index in curr_players ) {
      if ( curr_players.hasOwnProperty( index ) ) {
        curr_players[ index ].socket.write( move );
      }
    }
  };

  move_up = function ( player_id ) {
    var curr_players = players.curr_players,
      player = curr_players[ player_id ],
      player_no = player.player_no,
      player_pad_pos = player.pad_position,
      player_pad_new_pos = player_pad_pos - 1,
      new_move;

    if ( player_pad_new_pos !== 0 ) {
      new_move = graphics.make_paddle( player_no, player_pad_new_pos );
      make_the_move( new_move, curr_players );
      player.pad_position = player_pad_new_pos;
    }
  };
  
  move_down = function ( player_id ) {
    var curr_players = players.curr_players,
      player = curr_players[ player_id ],
      player_no = player.player_no,
      player_pad_pos = player.pad_position,
      player_pad_new_pos = player_pad_pos + 1,
      new_move;

    if ( player_pad_new_pos !== configMap.map_height - configMap.pad_height ) {
      new_move = graphics.make_paddle( player_no, player_pad_new_pos );
      make_the_move( new_move, curr_players );
      player.pad_position = player_pad_new_pos;
    }
  };

  move = function ( player_id, command ) {
    if ( command === configMap.move_up ) {
      move_up( player_id );
    }
    else if ( command === configMap.move_down ) {
      move_down( player_id );
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
      map_received  : false,
      pad_position  : 10
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
  };

  get_players = function () {
   return curr_players;
  };

  return {
    add_player : add_player,
    get_players    : get_players,
    curr_players : curr_players
  };

}());

graphics = ( function () {
  var
    make_map, get_map, make_paddle,
    append_start_position_paddle,
    append_reset_cursor_position,
    init_map,
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
      else {
        map_string += configMap.map_floor;
      }
      if ( w === configMap.map_width && h !== configMap.map_height ) {
         map_string += '\n\r';
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

init_map = function ( id ) {
  var curr_players = players.curr_players,
    player = curr_players[ id ];

  player.socket.write( '\033[2K\r' );
  player.socket.write( get_map() );
  if ( player.player_no === 0 ) {
    player.socket.write( '\033[12;1f' );
  }
  else {
    player.socket.write( '\033[12;80f' );
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

    for ( i = 1; i <= map_height_minus_pad; i++ ) {
      if ( i === position ) {
        for ( j = 1; j <= configMap.pad_height; j++ ) {
          paddle_string += configMap.pad_tile;
          if ( i + j !== configMap.map_height ) {
            paddle_string += '\b\033[B'; 
          }
        }
      }
      else {
        paddle_string += configMap.map_floor;
        if ( i + j !== configMap.map_height ) {
          paddle_string += '\b\033[B'; 
        }
      }
    }

    paddle_string += append_reset_cursor_position( player_no );
    
    return paddle_string; 
};

return {
  get_map : get_map,
  make_paddle : make_paddle,
  init_map : init_map
};

}());

//---------------- END PUBLIC METHODS ------------------------
//---------------- BEGIN MODULE INITILIZATION ----------------
//initModule = function () {};
//---------------- END MODULE INITILIZATION ------------------

module.exports = {
  graphics  : graphics,
  players   : players,
  movement  : movement,
  game      : game
};
