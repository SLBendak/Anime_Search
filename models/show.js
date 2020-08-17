'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class show extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.show.belongsToMany(models.user, {through: "usersShows"})
    }
  };
  show.init({
    title: DataTypes.STRING,
    writer: DataTypes.STRING,
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    studio: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'show',
  });
  return show;
};