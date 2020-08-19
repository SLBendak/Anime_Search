'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users_pins extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  users_pins.init({
    userId: DataTypes.INTEGER,
    pinId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'users_pins',
  });
  return users_pins;
};