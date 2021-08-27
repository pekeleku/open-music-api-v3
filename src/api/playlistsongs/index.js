/* eslint-disable max-len */
const PlaylistSongHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsongs',
  version: '1.0.0',
  register: async (server, {
    playlistSongsService, playlistsService, validator,
  }) => {
    const playlistsSongHandler = new PlaylistSongHandler(playlistSongsService, playlistsService, validator);
    server.route(routes(playlistsSongHandler));
  },
};
