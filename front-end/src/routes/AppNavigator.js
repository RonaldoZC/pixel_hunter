import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AssetDetailScreen from '../pages/AssetDetailScreen';
import AssetListScreen from '../pages/AssetListScreen';
import CartScreen from '../pages/CartScreen';
import HomeScreen from '../pages/HomeScreen';
import MyDataScreen from '../pages/MyDataScreen';
import MyProductsScreen from '../pages/MyProductsScreen';
import OrderDetailScreen from '../pages/OrderDetailScreen';
import SalesScreen from '../pages/SalesScreen';
import OrdersScreen from '../pages/OrdersScreen';
import ProductCreateScreen from '../pages/ProductCreateScreen';
import RegisterScreen from '../pages/RegisterScreen';
import SettingsScreen from '../pages/SettingsScreen';
import StoreMapScreen from '../pages/StoreMapScreen';
import SupportScreen from '../pages/SupportScreen';

const Stack = createNativeStackNavigator();

// Fluxo conforme os frames de design: Início -> Cadastro / Config / Mapa de Lojas.
export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      <Stack.Screen name="MyData" component={MyDataScreen} options={{ title: 'Meus Dados' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Meus Pedidos' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Pedido' }} />
      <Stack.Screen name="MyProducts" component={MyProductsScreen} options={{ title: 'Meus Produtos' }} />
      <Stack.Screen name="Sales" component={SalesScreen} options={{ title: 'Histórico de Vendas' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Atendimento ao Cliente' }} />
      <Stack.Screen
        name="ProductCreate"
        component={ProductCreateScreen}
        options={({ route }) => ({
          title: route.params?.product ? 'Editar Produto' : 'Cadastro de Produto',
        })}
      />
      <Stack.Screen name="StoreMap" component={StoreMapScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AssetList"
        component={AssetListScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ title: 'Detalhe do asset' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
    </Stack.Navigator>
  );
}
