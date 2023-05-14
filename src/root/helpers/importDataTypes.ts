import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import mongoose from 'mongoose';
import config from '../../root/configs';
import Type from '../../models/type';

const { password, name } = config.db;
const uri = `mongodb+srv://monday:${password}@cluster0.a4wkrfx.mongodb.net/${name}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log(`Connect to DB successfully`))
  .catch((error) => console.error(error));

const importData = async () => {
  try {
    await Type.createTypes();
    console.log('Import data successfully');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

importData();