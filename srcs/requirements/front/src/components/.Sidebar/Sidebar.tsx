import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import theme from './theme';

export function Sidebar() {
  return (
    <View style={styles.root}>
      <Text style={styles.logout}>
        {`Logout`}
      </Text>
      <Text style={styles.chat}>
        {`Chat`}
      </Text>
      <Text style={styles.pongGame}>
        {`Pong game`}
      </Text>
      <Text style={styles.profil}>
        {`Profil`}
      </Text>
      <Text style={styles.login}>
        {`Login`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: 260,
    height: 800,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  logout: {
    width: 260,
    height: 83,
    fontSize: 24,
    fontWeight: 400,
    textAlign: 'center',
    color: '#000000',
  },
  chat: {
    width: 260,
    height: 83,
    fontSize: 24,
    fontWeight: 400,
    textAlign: 'center',
    color: '#000000',
  },
  pongGame: {
    width: 260,
    height: 83,
    fontSize: 24,
    fontWeight: 400,
    textAlign: 'center',
    color: '#000000',
  },
  profil: {
    width: 260,
    height: 83,
    fontSize: 24,
    fontWeight: 400,
    textAlign: 'center',
    color: '#000000',
  },
  login: {
    width: 260,
    height: 83,
    fontSize: 24,
    fontWeight: 400,
    textAlign: 'center',
    color: '#000000',
  },
});
