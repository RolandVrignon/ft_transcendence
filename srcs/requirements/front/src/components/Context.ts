import React from 'react';
import { createContext, useContext, useState } from 'react';
import App from '../App';

export type User = {
    id:     number,
    email:  string,
    login:  string,
    firstName: string,
    imageLink: string,
    username: string,
    doubleAuth: string
}

export type GlobalContent = {
  user: User,
  connected: boolean,
  authChecked: boolean,
  setAuthChecked:  React.Dispatch<React.SetStateAction<boolean>>
}

export const AppContext = createContext<GlobalContent>({
    user: {
        id: -1,
        email: '',
        login: '',
        firstName: '',
        imageLink: '',
        username: '',
        doubleAuth: ''
    },
    connected: false,
    authChecked: false,
    setAuthChecked: (authChecked) => {}

})

// export  const AppContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => {}])
// export const context = useContext(AppContext)

// export  const AppContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => {}]);