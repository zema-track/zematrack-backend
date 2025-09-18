import { Song } from '../models';
import { IStatsFilter, ISongStats, Genre } from '../models';

export class SongStatsService {
  async getStats(filter: IStatsFilter = {}): Promise<ISongStats> {
    const matchStage = this.buildMatchStage(filter);

    // Get basic counts
    const [
      totalSongs,
      totalArtists,
      totalAlbums,
      songsByGenre,
      artistStats,
      albumStats,
    ] = await Promise.all([
      this.getTotalSongs(matchStage),
      this.getTotalArtists(matchStage),
      this.getTotalAlbums(matchStage),
      this.getSongsByGenre(matchStage),
      this.getArtistStats(matchStage),
      this.getAlbumStats(matchStage),
    ]);

    return {
      totalSongs,
      totalArtists,
      totalAlbums,
      songsByGenre,
      artistStats,
      albumStats,
    };
  }

  private buildMatchStage(filter: IStatsFilter) {
    const match: any = {};

    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) match.createdAt.$gte = filter.startDate;
      if (filter.endDate) match.createdAt.$lte = filter.endDate;
    }

    if (filter.genre) match.genre = filter.genre;
    if (filter.artist) match.artist = new RegExp(filter.artist, 'i');
    if (filter.album) match.album = new RegExp(filter.album, 'i');

    return match;
  }

  private async getTotalSongs(matchStage: any): Promise<number> {
    return Song.countDocuments(matchStage);
  }

  private async getTotalArtists(matchStage: any): Promise<number> {
    const result = await Song.aggregate([
      { $match: matchStage },
      { $group: { _id: '$artist' } },
      { $count: 'total' },
    ]);
    return result[0]?.total || 0;
  }

  private async getTotalAlbums(matchStage: any): Promise<number> {
    const result = await Song.aggregate([
      { $match: matchStage },
      { $group: { _id: { album: '$album', artist: '$artist' } } },
      { $count: 'total' },
    ]);
    return result[0]?.total || 0;
  }

  private async getSongsByGenre(
    matchStage: any
  ): Promise<Record<Genre, number>> {
    const result = await Song.aggregate([
      { $match: matchStage },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
    ]);

    // Initialize all genres with 0
    const songsByGenre = Object.values(Genre).reduce(
      (acc, genre) => ({ ...acc, [genre]: 0 }),
      {} as Record<Genre, number>
    );

    // Fill in actual counts
    result.forEach((item) => {
      songsByGenre[item._id as Genre] = item.count;
    });

    return songsByGenre;
  }

  private async getArtistStats(matchStage: any) {
    return Song.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$artist',
          totalSongs: { $sum: 1 },
          albums: { $addToSet: '$album' },
        },
      },
      {
        $project: {
          artist: '$_id',
          totalSongs: 1,
          totalAlbums: {
            $size: {
              $filter: {
                input: '$albums',
                cond: { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', ''] }] },
              },
            },
          },
          _id: 0,
        },
      },
      { $sort: { totalSongs: -1, artist: 1 } },
    ]);
  }

  private async getAlbumStats(matchStage: any) {
    return Song.aggregate([
      { $match: { ...matchStage } },
      {
        $group: {
          _id: { album: '$album', artist: '$artist' },
          totalSongs: { $sum: 1 },
        },
      },
      {
        $project: {
          album: '$_id.album',
          artist: '$_id.artist',
          totalSongs: 1,
          _id: 0,
        },
      },
      { $sort: { totalSongs: -1, album: 1 } },
    ]);
  }
}
