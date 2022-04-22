'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class UserSubscription extends Model {
    static associate(models) {
    }
  }
  UserSubscription.init({}, {
    sequelize,
    tableName: 'user_subscription',
    modelName: 'UserSubscription',
    timestamps: false
  });
  return UserSubscription;
};