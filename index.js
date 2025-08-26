/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Import vector icons to ensure they're loaded
import 'react-native-vector-icons/MaterialIcons';

AppRegistry.registerComponent(appName, () => App);
