'use strict';
const {
  Model, UniqueConstraintError
} = require('sequelize');
const { generateRandomString } = require('../util/encrypt');


module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Video, {
        foreignKey: 'author_id',
        as: 'videos'
      });
      this.belongsToMany(models.User, {
        through: models.UserSubscription,
        as: 'subscribedTo',
        foreignKey: 'subscriber_id',
        otherKey: 'content_maker_id'
      });
      this.belongsToMany(models.User, {
        through: models.UserSubscription,
        as: 'subscribers',
        foreignKey: 'content_maker_id',
        otherKey: 'subscriber_id'
      });
    }

    async logInWithToken() {
      if (this.authToken) {
        return;
      }

      while (true) {
        const authToken = generateRandomString(20);
        try {
          return this.update({ authToken }, { returning: ['auth_token'] });
        } catch (e) {
          if (!(e instanceof UniqueConstraintError)) {
            throw e;
          }
        }
      }
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'This email is already in use' },
      validate: {
        isEmail: { msg: 'Please enter a valid email' }
      }
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    newPassword: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    authToken: {
      type: DataTypes.STRING(40),
      allowNull: true,
      unique: true
    }
  }, {
    sequelize,
    tableName: 'obs_user',
    modelName: 'User',
    updatedAt: false
  });
  return User;
};