'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'author_id',
        as: 'author'
      });
    }
  }
  Video.init({
    isStream: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true // The video is first created without location
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'https://via.placeholder.com/1920x1080.png/008000C?text=No+Thumbnail+Specified'
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: ''
    }
  }, {
    sequelize,
    modelName: 'Video',
    tableName: 'video'
  });
  return Video;
};