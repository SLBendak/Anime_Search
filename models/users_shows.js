'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users_shows extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  users_shows.init({
    userId: DataTypes.INTEGER,
    showId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'users_shows',
  });
  return users_shows;
};