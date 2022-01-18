import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {MantineProvider} from '@mantine/core';
import {NotificationsProvider} from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

ReactDOM.render(
    <React.StrictMode>
        <MantineProvider theme={{colorScheme: 'dark'}} withGlobalStyles>
            <NotificationsProvider>
                <ModalsProvider>
                    <App/>
                </ModalsProvider>
            </NotificationsProvider>
        </MantineProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
