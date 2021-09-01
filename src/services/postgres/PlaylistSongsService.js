const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDbModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistSongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }

  async getSongsFromPlaylist(playlistId) {
    try {
      const result = await this._cacheService.get(`playlistsongs: ${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer
        FROM songs
        JOIN playlistsongs
        ON songs.id = playlistsongs.song_id WHERE playlistsongs.playlist_id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapDbModel);
      await this._cacheService.set(`playlistsongs:${playlistId}`, JSON.stringify(mappedResult));
      return mappedResult;
    }
  }

  async deleteSongFromPlaylists(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus');
    }

    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }
}
module.exports = PlaylistSongsService;
