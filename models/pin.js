'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.pin.belongsToMany(models.user, {through: "users_pins"})
    }
  };
  pin.init({
    title: DataTypes.STRING,
    image: DataTypes.STRING,
    seen: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'pin',
  });
  return pin;
};