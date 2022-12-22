const jwt = require("jsonwebtoken");
const {promisify} = require("util");
const UserRepository = require('../../services/UserManagerService/repository/userRepository')
const AgentRepository = require('../../services/AgentManagerService/repository/agentRepository')
const GeneralRepository = require('../../services/GeneralInformationService/repository/generalRepository')

class AccessManager {
  constructor() {
  }

  async checkAccessControl(req, res, feature) {

    try {
      let token;
      const header = req.headers;
      if (header.hasOwnProperty.call(header, 'refresh-token')) {
        let refreshToken = header['refresh-token'];
        let jwtPayload = this.parseJwt(refreshToken);
        let uid = jwtPayload.id;
        let user = await new UserRepository().getUser('userId', uid);
        if (!user)
          user = await new AgentRepository().getAgent('agentId', uid);
        if (user) {
          try {
            // const refreshTokenExists = await userRepository.findTokenBlackList(refreshToken);
            // if (refreshTokenExists.length > 0) {
            //   throw new Error;
            // }
            await promisify(jwt.verify)(refreshToken, process.env.REFRESH_JWT_SECRET);
          } catch (err) {
            res.removeHeader('refresh-token');
            throw{
              status: 401,
              data: {message: 'توکن منقی شده است ، لطفا دوباره لاگین کنید'}
            };
          }
          token = this.generateAccessToken(uid);
          res.setHeader('access-token', token);
        } else {
          throw {
            status: 400,
            data: {message: 'کاربری با این توکن وجود ندارد'}
          }
        }
      }
      const accessToken = header['access-token'] || token;
      if (!accessToken)
        throw {
          status: 400,
          data: {message: 'توکنی ارسال نشده است'}
        }
      const jwtPayload = this.parseJwt(accessToken);
      const uid = jwtPayload.id;
      let user = await new UserRepository().getUser('userId', uid);
      if (!user)
        user = await new AgentRepository().getAgent('agentId', uid);

      let {features} = await new GeneralRepository().getFeatures({role: user.role});

      if (!(features.includes(feature))) {
        throw {
          status: 403,
          data: {message: "شما اجازه دسترسی به این بخش را ندارید",}
        }
      }
      try {
        await promisify(jwt.verify)(accessToken, process.env.ACCESS_JWT_SECRET);
      } catch (e) {
        throw {
          status: 401,
          data: {message: 'توکن ارسالی منقضی شده است لطفا دوباره لاگین کنید'}
        }
      }

      req.userId = uid;
      req.role = user.role;
      req.nationalId= user.nationalId;

    } catch (err) {
      err.status = err.status || 400;
      throw{
        status: err.status,
        data: (err.data) ? err.data : err.message
      }
    }
  }


  parseJwt(token) {
    let base64Url = token.split('.')[1];
    let payload = Buffer.from(base64Url, 'base64');
    return JSON.parse(payload.toString());
  }

  generateAccessToken(id) {
    return jwt.sign({id}, process.env.ACCESS_JWT_SECRET, {
      expiresIn: process.env.ACCESS_JWT_EXPIRES_IN,
    });
  }

  generateRefreshToken(id) {
    return jwt.sign({id}, process.env.REFRESH_JWT_SECRET, {
      expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
    });
  }
}


module.exports = AccessManager;