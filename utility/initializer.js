const mongodb = require('mongodb');

const Redis = require('ioredis');

class Config {

  static async initMongo() {

    Config.redis = new Redis(
      {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_SERVER,
        password: process.env.REDIS_PASSWORD,
        connectTimeout: 10000,
        db: 0,
      });
    const mongoUsername = process.env.HIVE_MONGO_USERNAME
    const mongoPassword = process.env.HIVE_MONGO_PASSWORD
    Config.mongoConfig = {
      server: process.env.HIVE_MONGO_SERVER,
      port: process.env.HIVE_MONGO_PORT,
    };
    Config.databaseName = process.env.HIVE_MONGO_DATABASE;
    const mongoUrl = `mongodb://${mongoUsername}:${mongoPassword}@${Config.mongoConfig.server}:${Config.mongoConfig.port}`

    Config.mongoDBConnection = await mongodb.MongoClient.connect(
      mongoUrl,
      {useNewUrlParser: true}
    );
    Config.mongoDB = Config.mongoDBConnection.db(Config.databaseName);
  }


  // static async ways() {
  //   let i;
  //   let length;
  //   for(let j =0; j<38;j++) {
  //
  //     let data = []
  //     if(j===0){
  //        i = 190000
  //        length = ways.length
  //     }
  //
  //     for ( i ; i < length; i++) {
  //       if(ways[i].name !==null) {
  //         let data1 = {
  //           gid: ways[i].gid,
  //           osm_id: ways[i].osm_id,
  //           name: ways[i].name,
  //           source: ways[i].source,
  //           target: ways[i].target,
  //           location: {
  //             type: "Point",
  //             coordinates: [ways[i].y1, ways[i].x1]
  //           }
  //         }
  //         let data2 = {
  //           gid: ways[i].gid,
  //           osm_id: ways[i].osm_id,
  //           name: ways[i].name,
  //           source: ways[i].source,
  //           target: ways[i].target,
  //           location: {
  //             type: "Point",
  //             coordinates: [ways[i].y2, ways[i].x2]
  //           }
  //         }
  //         data.push(data1);
  //         data.push(data2);
  //       }
  //     }
  //     i = length;
  //     length = length+5000;
  //     if(j===37){
  //       console.log(length)
  //     }
  //     await Config.mongoDB.collection('map').insertMany(data);
  //     console.log('10000 data inserted');
  //
  //   }
  //
  //
  // }
  static async categories() {
    Config.categories = await Config.mongoDB.collection('categories').find({}, {projection: {_id: 0}}).toArray();
  }

  static async Initialize() {
    await Config.initMongo();
    await Config.categories();
  }
}

module.exports = Config;


