import express, { Request, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import Log from './log';
import getRaceIds from './get_raceids';
import getRace from './get_race';

const app = express();

app.disable('x-powered-by');

function asyncWrapper(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Log.info(`start: ${req.url}`);
    fn(req, res, next).then(() => Log.info(`end: ${req.url}`)).catch(next);
  };
}

app.get('/raceids', asyncWrapper(async (req, res) => {
  let date: DateTime;
  const paramDate = req.query.date;

  if (!paramDate) {
    date = DateTime.now().setZone('Asia/Tokyo');
  } else if (typeof paramDate === 'string') {
    date = DateTime.fromISO(paramDate).setZone('Asia/Tokyo');
    if (!date.isValid) {
      res.status(400).send('Bad date parameter');
      return;
    }
  } else {
    res.status(400).send('Bad date parameter');
    return;
  }

  const raceids = await getRaceIds(date);
  res.json(raceids);
}));

app.get('/races/:raceid', asyncWrapper(async (req, res) => {
  const { raceid } = req.params;

  if (raceid.length !== 16) {
    res.status(400).send('Bad raceid parameter');
    return;
  }

  if (!DateTime.fromISO(raceid.slice(0, 8)).isValid) {
    res.status(400).send('Bad raceid parameter');
    return;
  }

  const race = await getRace(raceid);
  res.json(race);
}));

app.all('/:wildcard', (req, res) => {
  res.sendStatus(404);
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  Log.error('error', err);
  res.sendStatus(500);
});

export default app;
