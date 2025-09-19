import { Request, Response } from 'express';
import { SongStatsService } from '../services/songStats.service';
import { IStatsFilter, Genre } from '../models';

export class SongStatsController {
  private statsService: SongStatsService;

  constructor() {
    this.statsService = new SongStatsService();
  }

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const filter = this.parseFilter(req.query);
      const stats = await this.statsService.getStats(filter);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching song stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch song statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  private parseFilter(query: any): IStatsFilter {
    const filter: IStatsFilter = {};

    if (query.startDate) {
      filter.startDate = new Date(query.startDate);
    }

    if (query.endDate) {
      filter.endDate = new Date(query.endDate);
    }

    if (query.genre && Object.values(Genre).includes(query.genre)) {
      filter.genre = query.genre as Genre;
    }

    if (query.artist) {
      filter.artist = query.artist.toString();
    }

    if (query.album) {
      filter.album = query.album.toString();
    }

    return filter;
  }
}
