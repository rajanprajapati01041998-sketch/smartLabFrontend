import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../Redux/features/counterSlice'
import { logger } from 'redux-logger';



export const store = configureStore({
    reducer: {
        counter: counterReducer,

    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),

})
