const Sequelize = require('sequelize');
const { STRING, ARRAY, FLOAT } = Sequelize;
const conn = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/nba_stats_db'
);

const syncAndSeed = async () => {
  await conn.sync({ force: true });

  let statistics = [
    {
      name: 'Free Throw',
    },
    {
      name: '2pt',
    },
    {
      name: '3pt',
    },
    {
      name: 'Ast',
    },
    {
      name: 'Rbd',
    },
    {
      name: 'Blk',
    },
    {
      name: 'Stl',
    },
  ];

  statistics = await Promise.all(
    statistics.map((statistic) => Statistic.create(statistic))
  );

  statistics = statistics.reduce((acc, statistic) => {
    acc[statistic.name] = statistic;
    return acc;
  }, {});

  let players = await Promise.all(
    ['L. James', 'S. Curry', 'K. Durant', 'G. Antetekoumpo', 'J. Embiid'].map(
      (name) => Player.create({ name })
    )
  );
  players = players.reduce((acc, player) => {
    acc[player.name] = player;
    return acc;
  }, {});

  const statlines = await Promise.all([
    // Statline.create({
    //   playerId: players.moe.id,
    //   statisticId: statistics.Tamarind.id,
    // }),
  ]);
  return {
    players,
    statistics,
    statlines,
  };
};

const Player = conn.define('player', {
  name: {
    type: STRING,
  },
});
const Statline = conn.define('statline', {});
const Statistic = conn.define('statistic', {
  name: {
    type: STRING,
  },
});

Statline.belongsTo(Player);
Statline.belongsTo(Statistic);

const express = require('express');
const app = express();
const chalk = require('chalk');
const path = require('path');

app.use(express.json());

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res, next) =>
  res.sendFile(path.join(__dirname, 'index.html'))
);

app.get('/api/players', async (req, res, next) => {
  try {
    res.send(await Player.findAll());
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/statistics', async (req, res, next) => {
  try {
    res.send(await Statistic.findAll());
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/players/:playerId/statlines', async (req, res, next) => {
  try {
    res.send(
      await Statline.findAll({ where: { playerId: req.params.playerId } })
    );
  } catch (ex) {
    next(ex);
  }
});

app.post('/api/players/:playerId/statlines', async (req, res, next) => {
  try {
    res.status(201).send(
      await Statline.create({
        playerId: req.params.playerId,
        statisticId: req.body.statisticId,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(chalk.red(err.stack));
  res.status(500).send({ error: err.message });
});
const port = process.env.PORT || 3000;

const init = async () => {
  await syncAndSeed();
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
