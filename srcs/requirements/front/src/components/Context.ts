import React, { createContext, useState } from 'react';

export  const AppContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => {}]);
