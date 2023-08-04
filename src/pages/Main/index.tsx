import { useEffect, useState } from 'react';
import { Appbar, BottomNavigation, Menu, Searchbar } from 'react-native-paper';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services';
import { Point } from '../../ts/interfaces/point-interfaces';
import { useNavigate } from '../../hooks/useNavigate';
import { SystemRoutes } from '../../ts/enums/routes';
import MapView from './MapView';
import ListView from './ListView';
import { AxiosResponse } from 'axios';
import { RouteNav } from '../../ts/interfaces/routes-interfaces';

const Main = () => {
  const [index, setIndex] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [token, setToken] = useState<string>('invalid');
  const [points, setPoints] = useState<Point[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { changeRoute } = useNavigate();

  const [routes] = useState<RouteNav[]>([
    { key: 'map', title: 'Localizações', focusedIcon: 'google-maps', unfocusedIcon: 'google-maps' },
    { key: 'list', title: 'Listagem completa', focusedIcon: 'format-list-bulleted-square' },
  ]);

  async function getToken(): Promise<void> {
    const tokenStorage = await AsyncStorage.getItem('@storage_Key');

    if (tokenStorage !== null)
      return setToken(tokenStorage);
  }

  async function handleFairs(): Promise<void> {
    await api.get<Point[]>(`/fairs?local=${searchQuery}`).then((response: AxiosResponse<Point[]>) => {
      setPoints(response.data);
    });
  }

  useEffect(() => {
    if(!searchQuery || searchQuery !== '') {
      api.get("/fairs").then(async (response: AxiosResponse<Point[]>) => {
        setPoints(await response.data);
      });
    }    
  }, [token]);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header style={{ backgroundColor: '#fff' }}>
          <Appbar.Content title="Farmer Market" color="#c62828" />
          <Menu
            onDismiss={() => setVisible(false)}
            visible={visible}
            anchor={
              <Appbar.Action color="#6C6C80" icon="dots-vertical" onPress={() => {
                getToken();
                setVisible(true);
              }}
              />
            }>
            {token !== 'invalid' ?
              <>
                <Menu.Item title="Nova Feira" onPress={() => {
                  changeRoute(SystemRoutes.NewFair);
                  setVisible(false);
                }} />
                <Menu.Item title="Meu Perfil" onPress={() => {
                  changeRoute(SystemRoutes.Profile);
                  setVisible(false);
                }} />
                <Menu.Item title="Minhas Feiras" onPress={() => {
                  changeRoute(SystemRoutes.MyFair);
                  setVisible(false);
                }} />
                <Menu.Item title="Sair" onPress={async () => {
                  setToken('invalid');
                  await AsyncStorage.setItem('@storage_Key', 'invalid');
                }} />
              </>
              :
              <>
                <Menu.Item title="Entrar" onPress={() => {
                  changeRoute(SystemRoutes.Login);
                  setVisible(false);
                }} />
                <Menu.Item title="Cadastrar-se" onPress={() => {
                  changeRoute(SystemRoutes.Register);
                  setVisible(false);
                }} />
              </>
            }
          </Menu>
        </Appbar.Header>

        <View style={{ backgroundColor: 'white' }}>
          <Searchbar
            placeholder="Busque a feira ou endereço"
            style={{ marginLeft: 16, marginRight: 16, marginBottom: 8 }}
            onChangeText={text => setSearchQuery(text)}
            value={searchQuery}
            onSubmitEditing={handleFairs}
          />
        </View>    
        
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={
            BottomNavigation.SceneMap({
              list: () => <ListView points={points} />,
              map: () => <MapView points={points} />,
            })}
        />
      </View>
    </>
  );
};

export default Main;