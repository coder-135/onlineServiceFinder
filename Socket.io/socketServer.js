const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const moment = require('moment-jalaali')
const {Server} = require("socket.io");
const io = new Server(server);
const SocketManagement = require('./socketManagementClass');


function socketServer() {

  server.listen(88, () => {
    console.log('--------------------------------------');
    console.log('Websocket Server Is Listening On *:88');
    console.log('--------------------------------------');
  });

  try {
    const onConnection = (socket) => {
      console.log(`a user connected with id ${socket.id} at ${moment().format('HH:mm:ss')}`);
      io.to(socket.id).emit('welcome', 'سلام به دنیای وب سوکت هایو خوش آمدید!');


      new SocketManagement(io).addUsers(socket);
      // درج اطلاعات کارگذار در ردیس
      new SocketManagement(io).addAgents(socket);


      //دریافت کارگذاران آنلاین
      new SocketManagement(io).onlineAgents(socket);

      // دریافت اطلاعات سرویس و ارسال قیمت به کاربر
      new SocketManagement(io).serviceCost(socket);

      //درخواست سرویس از سمت کاربر
      new SocketManagement(io).requestService(socket);

      //درخواست سرویس  تلفنی از سمت کاربر
      new SocketManagement(io).requestTelephoneService(socket);

      //درخواست رزرو سرویس از سمت کاربر
      new SocketManagement(io).reserveService(socket);

      // درخواست رزرو vip
      new SocketManagement(io).requestVipReserve(socket);

      // درخواست vip
      new SocketManagement(io).requestVip(socket);

      // قبول سرویس از سمت کارگذار و شروع به خدمت رسانی
      new SocketManagement(io).acceptService(socket);

      //کنسل کردن سرویس
      new SocketManagement(io).cancellation(socket);

      // شروع سرویس دهی کارگذار
      new SocketManagement(io).startService(socket);

      // شروع سرویس دهی سرویس رزروی برای کارگذار
      new SocketManagement(io).startReservedService(socket);

      // پایان سرویس دهی کارگذار
      new SocketManagement(io).endService(socket);

      //دیسکانکت از سوکت
      new SocketManagement(io).disconnect(socket);

    }
    io.on('connection', onConnection);
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = socketServer;