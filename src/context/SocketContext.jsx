// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useSnackbar } from 'notistack';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const socketRef = useRef(null);

    useEffect(() => {
        // Only connect if user is logged in
        if (user && user.userId) {
            // Initialize socket connection
            // We use the environment variable we set up earlier
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            socketRef.current = io(socketUrl);

            // Join the user's personal room
            socketRef.current.emit("join_room", user.userId);

            // GLOBAL LISTENER: Sound & Notification
            socketRef.current.on("transaction_received", (data) => {
                console.log("Global socket notification:", data);
                
                // 1. Play Sound
                const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3'); 
                audio.play().catch(e => console.log("Audio play failed", e));

                // 2. Show Snackbar
                enqueueSnackbar(`💰 Received ₹${data.amount} from ${data.senderName}!`, { 
                    variant: 'success', 
                    autoHideDuration: 5000,
                    style: { fontSize: '1rem', fontWeight: 600 }
                });
            });

            console.log(`Socket connected for ${user.userId}`);
        }

        // Cleanup on logout or unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, enqueueSnackbar]);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};