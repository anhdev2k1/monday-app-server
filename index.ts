import app from './src/root/app';
import { config } from './src/root/configs/index';

const PORT = config.app.port;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));