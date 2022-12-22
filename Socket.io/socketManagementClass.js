const uuid = require('uuid');
const moment = require('moment-jalaali');
const AgentRepository = require('../services/AgentManagerService/repository/agentRepository');
const GeneralRepository = require('../services/GeneralInformationService/repository/generalRepository');
const UserRepository = require('../services/UserManagerService/repository/userRepository');
const WalletRepository = require('../services/WalletService/repository/walletRepository');
const FactorRepository = require('../services/FactorService/repository/factorRepository');
const initializer = require("../utility/initializer");
const {
  sendAcceptanceServiceSms,
  arrivalAgentSms,
  endOfServiceSms,
  cancellationServiceSms
} = require('../utility/smsSender')

class socketManagement {

  constructor(io) {
    this.io = io;
  }

  // سوکت های کاربر
  addUsers(socket) {
    socket.on('users', async (userData) => {
      userData = typeof userData === 'string' ? JSON.parse(userData) : userData;
      userData = {
        ...userData,
        socketId: socket.id,
        userStatus: 'online'
      }
      const socketUserId = {
        socketId: socket.id,
        id: userData.userId,
        type: 'user'
      }
      await initializer.redis.hset('socketId', socket.id, JSON.stringify(socketUserId));
      await initializer.redis.hset('onlineUsers', userData.userId, JSON.stringify(userData));
    });
  }

  onlineAgents(socket) {
    socket.on('requestNearbyAgents', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      // console.log('--------------')
      // console.log(typeof  inputData)
      // console.log(inputData)
      // console.log('--------------')
      const onlineAgents = await this.findNearbyAgents(inputData, 5);
      // let onlineAgents = await initializer.redis.hgetall('onlineAgents');
      // onlineAgents = Object.values(onlineAgents).map(item => {
      //   return JSON.parse(item);
      // })
      //   const onlineAgents = [
      //     {
      //       userId: "ae6745a3-497b-42be-bb8b-d9a153012e8e",
      //       categoryId: "8fdda59f-4e55-48e9-b9d6-1add59da1b22",
      //       lat: 36.321121,
      //       lng: 59.506613,
      //       socketId: "t-znRJ2JzfUDb5a1AAAH"
      //     },
      //     {
      //       userId: "5c1026f6-b4d9-4fc0-bdcb-44d087f2638a",
      //       categoryId: "8fdda59f-4e55-48e9-b9d6-1add59da1b22",
      //       lat: 36.451275,
      //       lng: 59.864275,
      //       socketId: "BbNRNcjfOcEqjo5tAAAF"
      //     }
      //   ]
      this.io.to(socket.id).emit('onlineAgents', onlineAgents);
    });

  }

  serviceCost(socket) {
    socket.on('requestPrice', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
      // let cityDetail = {};
      let distance = 3000;
      let cost = 200000;
      let categoryDetail = await initializer.redis.hget('categoryPrice', inputData.categoryId);
      if(categoryDetail){
        categoryDetail = JSON.parse(categoryDetail);
        cost = parseInt(categoryDetail.cost);
        const cityDetail = await initializer.mongoDB.collection('districtCost').findOne({
          city: inputData.city,
          district: +inputData.district
        });
        if (cityDetail) {
          cost = cityDetail.costType === '1' ? cost : (cityDetail.costType === '2' ? cost + (cost * 0.5) : cost * 2);
          distance = cityDetail.distance
        }

        if (inputData.serviceType === 'reservation')
          cost = cost + (cost * 0.2);
      }



      this.io.to(socket.id).emit('receivePrice', {cost, distance});
    });
  }

  requestService(socket) {
    socket.on('requestService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      const userData = await new UserRepository().getUser('userId', inputData.userId);
      const category = await new GeneralRepository().getSingleCategory({id: inputData.categoryId});
      let vipAgentIds = [];
      userData.VIP.forEach(item => vipAgentIds.push(item.agentId));
      let service = {
        origin: {
          lat: inputData.lat,
          lng: inputData.lng
        },
        cost: inputData.cost,
        distance: inputData.distance,
        categoryId: inputData.categoryId,
        categoryName: category.name,
        description: inputData.description || null,
        userSocketId: socket.id,
        serviceCode: 'HIVE-' + uuid.v4(),
        serviceType: 'normal',
        serviceDate: moment().format('jYYYY/jMM/jDD'),
        address: inputData.address,
        state: 1,
        paymentType: inputData.paymentType,
        status: false,
        VipStatus: false,
        userId: inputData.userId,
        userFullName: userData.fullName,
        userNumber: userData.phoneNumber,
        expireTime: +moment().add(15, 'minute').format('HHmm')
      }
      await initializer.redis.hset('services', service.serviceCode, JSON.stringify(service));
      this.io.to(socket.id).emit('serviceDetails', service);
      while (service.expireTime >= +moment().format('HHmm')) {
        const stocks = await new WalletRepository().getAllStock();
        let onlineAgents = await this.findNearbyAgents(inputData, service.distance);
        let serviceStatus = await initializer.redis.hget('services', service.serviceCode);
        let reservedServices = await initializer.redis.hgetall('reservedServices');
        reservedServices = Object.values(reservedServices).map(item => {
          return JSON.parse(item);
        });
        serviceStatus = JSON.parse(serviceStatus);
        if (serviceStatus.state === 0 || serviceStatus.state === 2)
          break;
        onlineAgents.forEach(item => {
          const agentStock = stocks.filter(stock => item.agentId === stock.id);
          service.VipStatus = vipAgentIds.includes(item.agentId);
          if (reservedServices && reservedServices.length > 0) {
            const reservedAgent = reservedServices.filter(item2 => {
              return item2.agentId === item.agentId
            });
            if (reservedAgent && reservedAgent.length > 0) {
              let dueTime = moment(reservedAgent[0].reservationDateTime, 'jYYYY/jMM/jDD-HH:mm').subtract(2, 'hour').format('jYYYY/jMM/jDD-HH:mm');
              let now = moment().format('jYYYY/jMM/jDD-HH:mm');
              if (dueTime > now && agentStock[0].stock >= -300000) {
                let arrayService = [];
                arrayService[0] = service;
                this.io.to(item.socketId).emit('getService', arrayService);
              }
            } else {
              if (agentStock[0].stock >= -300000) {
                let arrayService = [];
                arrayService[0] = service;
                this.io.to(item.socketId).emit('getService', arrayService);
              }
            }
          } else {
            if (agentStock[0].stock >= -300000) {
              let arrayService = [];
              arrayService[0] = service;
              this.io.to(item.socketId).emit('getService', arrayService);
            } else {
              this.io.to(item.socketId).emit('walletStatus', [{message: 'موجودی کیف پول شما برای دریافت سرویس کافی نیست لطفا شارژ نمایید'}]);
            }
          }
        });
        await this.delay(15000);
      }
      service = await initializer.redis.hget('services', service.serviceCode);
      service = JSON.parse(service);
      if (service.state === 1 && service.expireTime <= +moment().format('HHmm')) {
        const result = {
          status: 'fail',
          message: 'متاسفانه سرویس شما پذیرفته نشد، لطفا مجددا تلاش کنید'
        }
        await initializer.redis.hdel('services', service.serviceCode);
        this.io.to(socket.id).emit('serviceResult', result);
      }
    })
  }

  reserveService(socket) {
    socket.on('reserveService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      const userData = await new UserRepository().getUser('userId', inputData.userId);
      const category = await new GeneralRepository().getSingleCategory({id: inputData.categoryId});
      const stocks = await new WalletRepository().getAllStock();
      const userStock = stocks.filter(item => item.id === inputData.userId);
      if (userStock[0].stock < inputData.cost) {
        this.io.to(socket.id).emit('walletStatus', [
          {message: 'موجودی کیف پول شما کمتر مبلغ سرویس درخواستی است، لطفا کیف پول خود را شارژنمایید'}]);
      }
      let vipAgentIds = [];
      userData.VIP.forEach(item => vipAgentIds.push(item));
      let service = {
        origin: {
          lat: inputData.lat,
          lng: inputData.lng
        },
        cost: inputData.cost + (inputData.cost * 0.2),
        distance: inputData.distance,
        categoryId: inputData.categoryId,
        categoryName: category.name,
        description: inputData.description || null,
        userSocketId: socket.id,
        serviceCode: 'HIVE-' + uuid.v4(),
        serviceType: 'reservation',
        serviceDate: moment().format('jYYYY/jMM/jDD'),
        address: inputData.address,
        paymentType: 'credit',
        paymentStatus: false,
        state: 1,
        status: false,
        userId: inputData.userId,
        userFullName: userData.fullName,
        userNumber: userData.phoneNumber,
        reservationDate: inputData.date,
        reservationTime: inputData.time,
        reservationDateTime: `${inputData.date}-${inputData.time}`
      }
      const reservationExpireTime = moment().add(5, 'hour').format('jYYYY/jMM/jDD-HH:mm');
      await initializer.redis.hset('reservedServices', service.serviceCode, JSON.stringify(service));
      while (moment().format('jYYYY/jMM/jDD-HH:mm') < reservationExpireTime) {
        //todo check if agent has reserved service
        let onlineAgents = await this.findNearbyAgents(inputData, service.distance);
        let serviceStatus = await initializer.redis.hget('reservedServices', service.serviceCode);
        serviceStatus = JSON.parse(serviceStatus);
        if (serviceStatus.state === 0 || serviceStatus.state === 2)
          break;
        onlineAgents.forEach(item => {
          const agentStock = stocks.filter(stock => item.agentId === stock.id);
          if (agentStock[0].stock >= -300000) {
            service.VipStatus = vipAgentIds.includes(item.agentId);
            let arrayService = [];
            arrayService[0] = service;
            this.io.to(item.socketId).emit('getService', arrayService);
          }
        });
        await this.delay(15000);
      }
      if (moment().format('jYYYY/jMM/jDD-HH:mm') > reservationExpireTime) {
        const result = {
          status: 'fail',
          message: 'متاسفانه سرویس شما پذیرفته نشد، لطفا مجددا تلاش کنید'
        }
        this.io.to(socket.id).emit('serviceResult', result);
      }
    })
  }

  requestTelephoneService(socket) {
    socket.on('telephoneService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      const userData = await new UserRepository().getUser('userId', inputData.userId);
      const category = await new GeneralRepository().getSingleCategory({id: inputData.categoryId});
      let vipAgentIds = [];
      userData.VIP.forEach(item => vipAgentIds.push(item));
      let service = {
        origin: {
          lat: inputData.lat,
          lng: inputData.lng
        },
        cost: inputData.cost,
        distance: inputData.distance,
        categoryId: inputData.categoryId,
        categoryName: category.name,
        description: inputData.description || null,
        userSocketId: socket.id,
        serviceCode: 'HIVE-' + uuid.v4(),
        serviceType: 'telephone',
        serviceDate: moment().format('jYYYY/jMM/jDD'),
        address: inputData.address,
        paymentType: inputData.paymentType,
        paymentStatus: false,
        state: 1,
        status: false,
        VipStatus: false,
        userId: inputData.userId,
        userFullName: userData.fullName,
        userNumber: userData.phoneNumber,
        expireTime: +moment().add(15, 'minute').format('HHmm')
      }
      await initializer.redis.hset('services', service.serviceCode, JSON.stringify(service));
      this.io.to(socket.id).emit('serviceDetails', service);
      while (service.expireTime >= +moment().format('HHmm')) {
        const stocks = await new WalletRepository().getAllStock();
        let onlineAgents = await this.findNearbyAgents(inputData, service.distance);
        let serviceStatus = await initializer.redis.hget('services', service.serviceCode);
        let reservedServices = await initializer.redis.hgetall('reservedServices');
        reservedServices = Object.values(reservedServices).map(item => {
          return JSON.parse(item);
        });
        serviceStatus = JSON.parse(serviceStatus);
        if (serviceStatus.state === 0 || serviceStatus.state === 2)
          break;
        onlineAgents.forEach(item => {
          const agentStock = stocks.filter(stock => item.agentId === stock.id);
          service.VipStatus = vipAgentIds.includes(item.agentId);
          if (reservedServices && reservedServices.length > 0) {
            const reservedAgent = reservedServices.filter(item2 => {
              return item2.agentId === item.agentId
            });
            if (reservedAgent && reservedAgent.length > 0) {
              let dueTime = moment(reservedAgent[0].reservationDateTime, 'jYYYY/jMM/jDD-HH:mm').subtract(2, 'hour').format('jYYYY/jMM/jDD-HH:mm');
              let now = moment().format('jYYYY/jMM/jDD-HH:mm');
              if (dueTime > now && agentStock[0].stock >= -300000) {
                let arrayService = [];
                arrayService[0] = service;
                this.io.to(item.socketId).emit('getService', arrayService);
              }
            } else {
              if (agentStock[0].stock >= -300000) {
                let arrayService = [];
                arrayService[0] = service;
                this.io.to(item.socketId).emit('getService', arrayService);
              }
            }
          } else {
            if (agentStock[0].stock >= -300000) {
              let arrayService = [];
              arrayService[0] = service;
              this.io.to(item.socketId).emit('getService', arrayService);
            }
          }
        });
        await this.delay(15000);
      }
      service = await initializer.redis.hget('services', service.serviceCode);
      service = JSON.parse(service);
      if (service.state === 1 && service.expireTime <= +moment().format('HHmm')) {
        //todo ارسال پیامک به کاربر که سرویسی پیدا نشد لطفا دوباره تماس بگیرد
        const result = {
          status: 'fail',
          message: 'متاسفانه سرویس شما پذیرفته نشد، لطفا مجددا تلاش کنید'
        }
        await initializer.redis.hdel('services', service.serviceCode);
        this.io.to(socket.id).emit('serviceResult', result);
      }
    })
  }

  requestVipReserve(socket) {
    socket.on('reserveVip', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      const userData = await new UserRepository().getUser('userId', inputData.userId);
      const agent = await new AgentRepository().getAgent('agentId', inputData.agentId);
      const category = await new GeneralRepository().getSingleCategory({id: inputData.categoryId});
      const userStock = await new WalletRepository().getStock({id: inputData.userId});
      if (inputData.cost > userStock.stock) {
        this.io.to(socket.id).emit('walletStatus', [
          {message: 'موجودی کیف پول شما کمتر مبلغ سرویس درخواستی است، لطفا کیف پول خود را شارژنمایید'}]);
      } else {
        let service = {
          origin: {
            lat: inputData.lat,
            lng: inputData.lng
          },
          cost: inputData.cost,
          distance: inputData.distance,
          categoryId: inputData.categoryId,
          categoryName: category.name,
          description: inputData.description || null,
          userSocketId: socket.id,
          serviceCode: 'HIVE-' + uuid.v4(),
          serviceType: 'reservation',
          serviceDate: moment().format('jYYYY/jMM/jDD'),
          address: inputData.address,
          state: 1,
          paymentType: 'credit',
          status: false,
          VipStatus: true,
          userId: inputData.userId,
          userFullName: userData.fullName,
          userNumber: userData.phoneNumber,
          reservationDate: inputData.date,
          reservationTime: inputData.time,
          reservationDateTime: `${inputData.date}-${inputData.time}`,
          agentId: inputData.agentId,
          agentFullName: agent.fullName,
          agentNumber: agent.phoneNumber,
          agentAvatarUrl: agent.avatarUrl
        }
        await initializer.redis.hset('services', service.serviceCode, JSON.stringify(service));
        service.operatorStatus = false;
        //todo send notification to panel
        await initializer.mongoDB.collection('services').insertOne(service);
        this.io.to(socket.id).emit('serviceResult',
          [{message: 'سرویس شما ثبت شد پس از بررسی پشتیبان های هایو با شما تماس گرفته خواهد شد'}]);
      }
    })
  }

  requestVip(socket) {
    socket.on('requestVip', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      const userData = await new UserRepository().getUser('userId', inputData.userId);
      const agent = await new AgentRepository().getAgent('agentId', inputData.agentId);
      const category = await new GeneralRepository().getSingleCategory({id: inputData.categoryId});
      let service = {
        origin: {
          lat: inputData.lat,
          lng: inputData.lng
        },
        cost: inputData.cost,
        distance: inputData.distance,
        categoryId: inputData.categoryId,
        categoryName: category.name,
        description: inputData.description || null,
        userSocketId: socket.id,
        serviceCode: 'HIVE-' + uuid.v4(),
        serviceType: 'normal',
        serviceDate: moment().format('jYYYY/jMM/jDD'),
        address: inputData.address,
        state: 1,
        paymentType: inputData.paymentType,
        status: false,
        VipStatus: true,
        userId: inputData.userId,
        userFullName: userData.fullName,
        userNumber: userData.phoneNumber,
        agentId: inputData.agentId,
        agentFullName: agent.fullName,
        agentNumber: agent.phoneNumber,
        agentAvatarUrl: agent.avatarUrl
      }
      await initializer.redis.hset('services', service.serviceCode, JSON.stringify(service));
      service.operatorStatus = false;
      //todo send notification to panel
      await initializer.mongoDB.collection('services').insertOne(service);
      this.io.to(socket.id).emit('serviceResult',
        [{message: 'سرویس شما ثبت شد پس از بررسی پشتیبان های هایو با شما تماس گرفته خواهد شد'}]);
    })
  }

  // سوکت های کارگذار
  addAgents(socket) {
    //درج اطلاعات کارگذار در ردیس
    socket.on('agents', async (agentData) => {
      agentData = typeof agentData === 'string' ? JSON.parse(agentData) : agentData;
      let agentStock = await new WalletRepository().getStock({id: agentData.agentId});
      if (agentStock.stock >= -300000) {
        agentData = {
          ...agentData,
          socketId: socket.id,
          serviceStatus: 'free',
          serviceEndTime: null,
          agentStatus: 'online'
        }
        const socketAgentId = {
          socketId: socket.id,
          id: agentData.agentId,
          type: 'agent'
        }
        let agentStatus = await initializer.redis.hget('onlineAgents', agentData.agentId);
        agentStatus = JSON.parse(agentStatus);
        if (agentStatus && agentStatus.serviceStatus === 'active') {
          agentData.serviceStatus = agentStatus.serviceStatus;
          agentData.serviceEndTime = agentStatus.serviceEndTime;
        }
        await initializer.redis.geoadd('onlineLocations', agentData.lat, agentData.lng, agentData.agentId);
        await initializer.redis.hset('onlineAgents', agentData.agentId, JSON.stringify(agentData));
        await initializer.redis.hset('socketId', socket.id, JSON.stringify(socketAgentId));
      } else {
        this.io.to(socket.id).emit('walletStatus', [
          {message: 'موجودی کیف پول شما منفی سی هزار تومان است، لطفا کیف پول خود را شارژنمایید'}]);
      }
    });
  }

  acceptService(socket) {
    socket.on('acceptService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      let service = await initializer.redis.hget('services', inputData.serviceCode);
      let agentRedisData = await initializer.redis.hget('onlineAgents', inputData.agentId);
      const agent = await new AgentRepository().getAgent('agentId', inputData.agentId);
      if (service && agent) {
        service = JSON.parse(service);
        agentRedisData = JSON.parse(agentRedisData);
        agentRedisData.serviceStatus = 'active';
        agentRedisData.serviceEndTime = moment().add(30, 'minute').format('HHmm');
        service.state = 2;
        service = {
          ...service,
          agentId: agent.agentId,
          agentSocketId: socket.id,
          agentFullName: agent.fullName,
          agentNumber: agent.phoneNumber,
          agentAvatarUrl: agent.avatarUrl
        }
        await initializer.redis.hset('services', service.serviceCode, JSON.stringify(service));
        await initializer.redis.hset('onlineAgents', agentRedisData.agentId, JSON.stringify(agentRedisData));
        await initializer.mongoDB.collection('services').insertOne(service);
        if (service.serviceType === 'telephone') {
          const smsData = {
            userPhoneNumber: service.userNumber,
            agentPhoneNumber: service.agentNumber,
            fullName: service.agentFullName,
            serviceCode: service.serviceCode,
            pattern: 'acceptanceService'
          }
          await sendAcceptanceServiceSms(smsData);
          this.io.to(socket.id).emit('serviceResult', service);
        } else {
          this.io.to(service.userSocketId).emit('serviceResult', service);
          this.io.to(socket.id).emit('serviceResult', service);
        }
      } else {
        let userStock = await new WalletRepository().getStock({id: service.userId});
        let agentStock = await new WalletRepository().getStock({id: service.agentId});
        const agent = await new AgentRepository().getAgent('agentId', inputData.agentId);
        const hiveShare = ((service.cost * categoryDetails.percentInterest) / 100);
        const agentShare = service.cost - hiveShare;
        const newUserStock = {
          id: service.userId,
          stock: userStock.stock - service.cost
        };
        const newAgentStock = {
          id: service.agentId,
          stock: agentStock.stock + agentShare
        };
        const hiveStock = {
          id: 'hive',
          stock: hiveShare
        };
        const factors = [
          {
            factorTitle: 'پرداخت اعتباری',
            increaseStatus: true,
            factorType: 'local',
            ownerId: service.agentId,
            serviceCode: service.serviceCode,
            factorId: uuid.v4(),
            amount: service.cost,
            date: moment().format('jYYYYjMMjDD'),
            time: moment().format('HH:mm:ss')
          },
          {
            factorTitle: 'افزایش اعتبار',
            increaseStatus: true,
            factorType: 'local',
            ownerId: 'hive',
            serviceCode: service.serviceCode,
            factorId: uuid.v4(),
            amount: service.cost,
            date: moment().format('jYYYYjMMjDD'),
            time: moment().format('HH:mm:ss')
          }
        ]

        service = JSON.parse(service);
        service = {
          ...service,
          agentId: agent.agentId,
          agentSocketId: socket.id,
          agentNumber: agent.phoneNumber,
          agentFullName: agent.fullName,
          agentAvatarUrl: agent.avatarUrl
        }

        //todo Add transaction
        await new WalletRepository().updateStock(newUserStock);
        await new WalletRepository().updateStock(newAgentStock);
        await new WalletRepository().incrementStock(hiveStock);
        await new FactorRepository().addManyFactors(factors);

        await initializer.redis.hset('services', service.serviceCode, JSON.stringify(service));
        await initializer.mongoDB.collection('services').insertOne(service);
        this.io.to(service.userSocketId).emit('serviceResult', service);
        this.io.to(socket.id).emit('serviceResult', service);
      }
    })
  }

  cancellation(socket) {
    socket.on('cancelService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      if (inputData && inputData.serviceCode && inputData.reason) {
        let service = await initializer.redis.hget('services', inputData.serviceCode);
        service = JSON.parse(service);
        let agentRedisData = await initializer.redis.hget('onlineAgents', service.agentId);
        agentRedisData = JSON.parse(agentRedisData);

        if (service.state === 1 || service.state === 2) {
          if (service.state === 2) {
            // درخواست کنسلی از سمت کاربر
            if (socket.id === service.userId) {
              this.io.to(service.agentSocketId).emit('cancellationStatus', [{message: 'سرویس شما توسط کاربر لغو شد'}]);
            }
            //درخواست کنسلی از سمت کارگذار
            else {
              if (service.serviceType === 'telephone') {
                const smsData = {
                  userPhoneNumber: service.userNumber,
                  fullName: service.userFullName
                }
                await cancellationServiceSms(smsData);
              } else {
                const message = {
                  message: 'سرویس شما توسط کارگذار لغو شد'
                }
                this.io.to(socket.id).emit('cancellationStatus', message);
              }
            }
          }
          service.state = 0;
          service.cancellationReason = inputData.reason;

          agentRedisData.serviceStatus = 'free';
          agentRedisData.serviceEndTime = null;
          await initializer.redis.hset('onlineAgents', agentRedisData.agentId, JSON.stringify(agentRedisData));
          await initializer.redis.hset('services', inputData.serviceCode, JSON.stringify(service));
          await initializer.mongoDB.collection('cancelledServices').insertOne(service);
        } else {
          const message = {
            message: 'شما نمی توانید سرویس را لغو کنید'
          }
          this.io.to(socket.id).emit('cancellationStatus', message);
        }
      }
    })
  }

  // پیچیده ترین سوکت
  startService(socket) {
    socket.on('startService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      if (inputData && inputData.serviceCode) {
        let service = await initializer.redis.hget('services', inputData.serviceCode);
        service = JSON.parse(service);
        const agentData = await new AgentRepository().getAgent('agentId', service.agentId);
        const userData = await new UserRepository().getUser('userId', service.userId);
        let userStock = await new WalletRepository().getStock({id: service.userId});
        let agentStock = await new WalletRepository().getStock({id: service.agentId});
        let categoryDetails = await initializer.redis.hget('categoryPrice', service.categoryId);
        categoryDetails = JSON.parse(categoryDetails);

        // در صورتی کاربر سرویس اولش باشد
        if (userData.serviceCounter === 0) {
          const isInvited = await new GeneralRepository().getInvitation({
            phoneNumber: service.userNumber,
            status: false
          });
          if (isInvited) {
            // بیست هزار تومن کیف پول کاربری که دعوت کرده است شارژ می شود
            await new WalletRepository().incrementStock({id: isInvited.id, stock: 200000});
            await new GeneralRepository().updateInvitation({id: isInvited.id, phoneNumber: isInvited.phoneNumber},
              {status: true})
          }
        }
        // درصورت اولین سرویس کارگذار
        if (agentData.serviceCounter === 0) {
          const isInvited = await new GeneralRepository().getInvitation({
            phoneNumber: service.agentNumber,
            status: false
          });
          if (isInvited) {
            await new AgentRepository().incrementServiceCounterAgent({agentId: isInvited.id},
              {$inc: {amazingServiceCounter: 1}})
            await new GeneralRepository().updateInvitation({id: isInvited.id, phoneNumber: isInvited.phoneNumber},
              {status: true})
          }
        }
        // درصورتی که کارگذار سرویس شگفت انگیز دارد
        if (agentData.amazingServiceCounter >= 1) {
          if (service.paymentType === 'credit') {
            const agentShare = service.cost;
            const newUserStock = {
              id: service.userId,
              stock: userStock.stock - service.cost
            };
            const newAgentStock = {
              id: service.agentId,
              stock: agentStock.stock + agentShare
            };

            const factors = [
              {
                factorTitle: 'پرداخت اعتباری',
                increaseStatus: true,
                factorType: 'local',
                ownerId: service.agentId,
                serviceCode: service.serviceCode,
                factorId: uuid.v4(),
                amount: service.cost,
                date: moment().format('jYYYYjMMjDD'),
                time: moment().format('HH:mm:ss')
              }
            ]
            //todo Add transaction
            await new WalletRepository().updateStock(newUserStock);
            await new WalletRepository().updateStock(newAgentStock);
            await new FactorRepository().addManyFactors(factors);

          }
          await new AgentRepository().incrementServiceCounterAgent({agentId: service.agentId}, {
            $inc: {amazingServiceCounter: -1}
          })
        } else {
          if (service.paymentType === 'credit') {
            const hiveShare = ((service.cost * categoryDetails.percentInterest) / 100);
            const agentShare = service.cost - hiveShare;
            const newUserStock = {
              id: service.userId,
              stock: userStock.stock - service.cost
            };
            const newAgentStock = {
              id: service.agentId,
              stock: agentStock.stock + agentShare
            };
            const hiveStock = {
              id: 'hive',
              stock: hiveShare
            };
            const factors = [
              {
                factorTitle: 'دریافت اعتباری حق سرویس',
                increaseStatus: true,
                factorType: 'local',
                ownerId: service.agentId,
                serviceCode: service.serviceCode,
                factorId: uuid.v4(),
                amount: service.cost,
                date: moment().format('jYYYYjMMjDD'),
                time: moment().format('HH:mm:ss')
              },
              {
                factorTitle: 'افزایش اعتبار هایو',
                increaseStatus: true,
                factorType: 'local',
                ownerId: 'hive',
                serviceCode: service.serviceCode,
                factorId: uuid.v4(),
                amount: service.cost,
                date: moment().format('jYYYYjMMjDD'),
                time: moment().format('HH:mm:ss')
              }
            ]
            //todo Add transaction
            await new WalletRepository().updateStock(newUserStock);
            await new WalletRepository().updateStock(newAgentStock);
            await new WalletRepository().incrementStock(hiveStock);
            await new FactorRepository().addManyFactors(factors);

          } else {
            const hiveShare = ((service.cost * categoryDetails.percentInterest) / 100);
            const newAgentStock = {
              id: service.agentId,
              stock: agentStock.stock - hiveShare
            }
            const hiveStock = {
              id: 'hive',
              stock: hiveShare
            };
            const factors = [
              {
                factorTitle: 'کمیسیون',
                increaseStatus: false,
                factorType: 'local',
                ownerId: service.agentId,
                serviceCode: service.serviceCode,
                factorId: uuid.v4(),
                amount: hiveShare,
                date: moment().format('jYYYYjMMjDD'),
                time: moment().format('HH:mm:ss')
              },
              {
                factorTitle: 'افزایش اعتبار هایو',
                increaseStatus: true,
                factorType: 'local',
                ownerId: 'hive',
                serviceCode: service.serviceCode,
                factorId: uuid.v4(),
                amount: hiveShare,
                date: moment().format('jYYYYjMMjDD'),
                time: moment().format('HH:mm:ss')
              }
            ]
            await new WalletRepository().updateStock(newAgentStock);
            await new WalletRepository().incrementStock(hiveStock);
            await new FactorRepository().addManyFactors(factors);
          }
        }

        service.state = 3;
        if (service.serviceType === 'telephone') {
          const smsData = {
            userPhoneNumber: service.userNumber,
            agentPhoneNumber: service.agentNumber,
            serviceCode: service.serviceCode,
            pattern: 'arrivalAgent'
          }
          await arrivalAgentSms(smsData);
        } else {
          this.io.to(service.userSocketId).emit('agentArrival', {message: 'کارگذار رسید'});
        }
        const missionQuery = {
          categoryId: service.categoryId,
          endDate: {$gte: moment().format('jYYYYjMMjDD')}
        }
        const mission = await new GeneralRepository().getMission(missionQuery);
        // اگر ماموریت وجود داشت و زمان ماموریت تمام نشده بود
        if (mission && mission.endTime < moment().format('HH:mm:ss')) {
          const missionCounterData = {
            agentId: service.agentId,
            categoryId: service.categoryId,
            date: moment().format('jYYYY/jMM/jDD')
          }
          const missionCounterStatus = await new GeneralRepository().getMissionCounter(missionCounterData);
          if (!missionCounterStatus) {
            // درصورتی که سرویس اول باشد
            const initialMissionCounterData = {
              title: mission.title,
              agentId: service.agentId,
              categoryId: service.categoryId,
              date: moment().format('jYYYY/jMM/jDD'),
              counter: 1
            }
            await new GeneralRepository().updateMissionCounter(initialMissionCounterData);
          } else {
            //بررسی چندمین سرویس و اعمال مبلغ جایزه
            const newMissionCounterData = {
              title: mission.title,
              agentId: service.agentId,
              categoryId: service.categoryId,
              date: moment().format('jYYYY/jMM/jDD'),
              counter: missionCounterStatus.counter + 1
            }
            //کارگذار ماموریت را با موفقیت انجام داده است
            if (newMissionCounterData.counter === mission.count) {
              const prizeStock = {
                id: service.agentId,
                stock: mission.value
              }
              await new WalletRepository().incrementStock(prizeStock);
              this.io.to(socket.id).emit('mission', [{message: `ماموریت با موفقیت انجام شد، کیف پول شما مبلغ ${mission.value} ریال شارژ شد `}]);
            }
            await new GeneralRepository().updateMissionCounter(newMissionCounterData)
          }
        }

        await new AgentRepository().incrementServiceCounterAgent({agentId: service.agentId},
          {
            $inc: {serviceCounter: 1}
          })

        await new UserRepository().incrementServiceCounterUser({userId: service.userId},
          {
            $inc: {serviceCounter: 1}
          })

        await initializer.redis.hset('services', inputData.serviceCode, JSON.stringify(service))
      }
    })
  }

  startReservedService(socket) {
    socket.on('startReservedService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      if (inputData && inputData.serviceCode) {
        let service = await initializer.redis.hget('services', inputData.serviceCode);
        service = JSON.parse(service);
        let agentRedisData = await initializer.redis.hget('onlineAgents', service.agentId);
        agentRedisData = JSON.parse(agentRedisData);
        agentRedisData.serviceStatus = 'active';
        agentRedisData.serviceEndTime = moment().add(30, 'minute').format('HHmm');
        service.state = 3;
        const smsData = {
          userPhoneNumber: service.userNumber,
          agentPhoneNumber: service.agentNumber,
          serviceCode: service.serviceCode,
          pattern: 'arrivalAgent'
        }
        await arrivalAgentSms(smsData);
        await initializer.redis.hset('onlineAgents', agentRedisData.agentId, JSON.stringify(agentRedisData));
        await initializer.redis.hset('services', inputData.serviceCode, JSON.stringify(service));
      }
    })
  }

  endService(socket) {
    socket.on('endService', async (inputData) => {
      inputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData
      if (inputData && inputData.serviceCode) {
        let service = await initializer.redis.hget('services', inputData.serviceCode);
        service = JSON.parse(service);
        service.state = 4;
        service.status = true;
        let agentRedisData = await initializer.redis.hget('onlineAgents', service.agentId);
        agentRedisData = JSON.parse(agentRedisData);
        agentRedisData.serviceStatus = 'free';
        agentRedisData.serviceEndTime = null;
        await initializer.redis.hset('onlineAgents', agentRedisData.agentId, JSON.stringify(agentRedisData));
        await initializer.redis.hset('services', inputData.serviceCode, JSON.stringify(service));
        await initializer.mongoDB.collection('services').updateOne({serviceCode: service.serviceCode}, {
          $set: service
        }, {upsert: true});
        this.io.to(service.userSocketId).emit('serviceResult', [{message: 'خدمت شما به پایان رسید لطفا در نظرسنجی شرکت کنید'}]);
        this.io.to(socket.id).emit('serviceResult', [{message: 'خدمت شما به پایان رسید لطفا در نظرسنجی شرکت کنید'}]);
        if (service.serviceType === 'telephone') {
          const smsData = {
            userPhoneNumber: service.userNumber,
            serviceCode: service.serviceCode,
            pattern: 'endOfService'
          }
          await endOfServiceSms(smsData);
        }
      }
    })
  }

  disconnect(socket) {
    socket.on('disconnect', async () => {
      let socketId = await initializer.redis.hget('socketId', socket.id);
      socketId = JSON.parse(socketId);
      if (socketId) {
        if (socketId.type === 'agent') {
          let agentRedisData = await initializer.redis.hget('onlineAgents', socketId.id);
          agentRedisData = JSON.parse(agentRedisData);
          agentRedisData.agentStatus = 'offline'
          await initializer.redis.hset('onlineAgents', agentRedisData.agentId, JSON.stringify(agentRedisData));
          initializer.redis.zrem('onlineLocations', socketId.id);
          initializer.redis.hdel('socketId', socket.id);
        } else {
          let userRedisData = await initializer.redis.hget('onlineUsers', socketId.id);
          userRedisData = JSON.parse(userRedisData);
          userRedisData.userStatus = 'offline';
          await initializer.redis.hset('onlineUsers', userRedisData.userId, JSON.stringify(userRedisData));
          initializer.redis.hdel('socketId', socket.id);
        }
      }
      console.log(`user disconnected with id ${socket.id} at ${moment().format('HH:mm:ss')}`);
    });
  }

  async findNearbyAgents(inputData, distance) {
    let nearGeolocations = await initializer.redis
      .georadius('onlineLocations', inputData.lat, inputData.lng, distance, 'km', 'WITHDIST', 'WITHCOORD');
    nearGeolocations = nearGeolocations.map(item => {
      return item.toString().split(',');
    });
    let onlineAgents = [];
    for (let i = 0; i < nearGeolocations.length; i++) {
      let agent = await initializer.redis.hget('onlineAgents', nearGeolocations[i][0]);
      agent = agent ? JSON.parse(agent) : null;
      if (agent && agent.agentStatus === 'online' && agent.serviceStatus === 'free') {
        let counter = agent.categoryId.length;
        let categoryIds = agent.categoryId;
        for (let index = 0; index < counter; index++) {
          const myOwnData = {
            agentId: agent.agentId,
            categoryId: categoryIds[index],
            lat: agent.lat,
            lng: agent.lng,
            socketId: agent.socketId,
            distance: parseInt(nearGeolocations[i][1])
          }
          onlineAgents.push(myOwnData);
        }
        // categoryIds.map(item=>{
        //   agent.categoryId = item;
        //   agent.distance = parseInt(nearGeolocations[i][1]);
        //   onlineAgents.push(agent)
        // })
      }
    }
    onlineAgents = onlineAgents.filter(item => {
      return item.categoryId === inputData.categoryId;
    })

    return onlineAgents;

  }

  async delay(ms) {
    return new Promise(res => {
      return setTimeout(res, ms);
    });
  }

}


module.exports = socketManagement
