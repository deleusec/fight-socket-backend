import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import log from '../utils/logger';
import { CharacterType, ICharacter } from '../types/Character';
import { Warrior, Mage, Archer, Healer } from '../classes';

const rooms = new Map();

export const server = (app: Server) => {
    const io = new SocketServer(app, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    io.on('connection', (socket) => {
        log(`User connected: ${socket.id}`, 'info');

        socket.on('disconnect', () => {
            log(`User disconnected: ${socket.id}`, 'info');
            for (const [room, roomData] of rooms) {
                roomData.users = roomData.users.filter((user: any) => user.id !== socket.id);
                io.to(room).emit('players', roomData.users);
                if (roomData.users.length === 0) {
                    rooms.delete(room);
                }
            }
        });

        socket.on('join', (roomId: string) => {
            if (!rooms.has(roomId)) {
                rooms.set(roomId, { users: [] });
            }
            const roomData = rooms.get(roomId);
            const existingUser = roomData.users.find((user: any) => user.id === socket.id);

            if (existingUser) {
                existingUser.socketId = socket.id;
                log(`User rejoined room: ${roomId}`, 'info');
            } else if (roomData.users.length < 2) {
                socket.join(roomId);
                roomData.users.push({ id: socket.id, character: null });
                log(`User joined room: ${roomId}`, 'info');
            } else {
                socket.emit('roomFull');
                return;
            }

            io.to(roomId).emit('players', roomData.users);
            updateRoomList();
        });

        socket.on('leave', (roomId: string) => {
            const roomData = rooms.get(roomId);
            if (roomData) {
                roomData.users = roomData.users.filter((user: any) => user.id !== socket.id);
                socket.leave(roomId);
                io.to(roomId).emit('players', roomData.users);
                if (roomData.users.length === 0) {
                    rooms.delete(roomId);
                }
                updateRoomList();
            }
        });

        socket.on('character', ({ roomId, character }: { roomId: string, character: CharacterType }) => {
            const roomData = rooms.get(roomId);
            if (!roomData) {
                return;
            }

            const user = roomData.users.find((user: any) => user.id === socket.id);
            if (!user) {
                return;
            }

            let characterInstance: ICharacter;
            switch (character) {
                case 'Warrior':
                    characterInstance = new Warrior();
                    break;
                case 'Mage':
                    characterInstance = new Mage();
                    break;
                case 'Archer':
                    characterInstance = new Archer();
                    break;
                case 'Healer':
                    characterInstance = new Healer();
                    break;
                default:
                    throw new Error('Invalid character type');
            }

            user.character = characterInstance;
            io.to(roomId).emit('character', { id: user.id, character });

            const enemy = roomData.users.find((user: any) => user.id !== socket.id);
            if (enemy && enemy.character) {
                io.to(roomId).emit('roomUpdated', roomData);
                startCountdown(io, roomId);
            }
        });

        const startCountdown = (io: SocketServer, roomId: string) => {
            let countdown = 5;
            const interval = setInterval(() => {
                io.to(roomId).emit('countdown', countdown);
                if (countdown === 0) {
                    clearInterval(interval);
                    const roomData = rooms.get(roomId);
                    io.to(roomId).emit('start', roomData.users);
                    if (roomData) {
                        const firstTurnPlayer = roomData.users[Math.floor(Math.random() * 2)].id;
                        io.to(roomId).emit('turn', firstTurnPlayer);

                        // Emit initial health data
                        const healthData = {
                            yourHealth: roomData.users[0].character.health,
                            enemyHealth: roomData.users[1].character.health,
                        };
                        io.to(roomId).emit('initialHealth', healthData);
                    }
                }
                countdown -= 1;
            }, 1000);
        };

        socket.on('attack', (roomId: string, targetId: string) => {
            const roomData = rooms.get(roomId);
            const attackerUser = roomData.users.find((user: any) => user.id === socket.id);
            const targetUser = roomData.users.find((user: any) => user.id === targetId);
            const attacker = attackerUser.character;
            const target = targetUser.character;

            if (attacker && target) {
                attacker.attack(target);
                io.to(roomId).emit('updateHealth', { id: targetUser.id, health: target.health });
                io.to(roomId).emit('updateHealth', { id: attackerUser.id, health: attacker.health });
                io.to(roomId).emit('turn', targetUser.id);
                checkGameOver(io, roomId, attackerUser, targetUser);
            }
        });

        socket.on('heal', (roomId: string) => {
            const roomData = rooms.get(roomId);
            const playerUser = roomData.users.find((user: any) => user.id === socket.id);
            const player = playerUser.character;

            if (player) {
                player.heal();
                socket.emit('updateHealth', { id: playerUser.id, health: player.health });
                const enemyUser = roomData.users.find((user: any) => user.id !== socket.id);
                io.to(roomId).emit('turn', enemyUser.id);
            }
        });

        socket.on('specialMove', (roomId: string, targetId: string) => {
            const roomData = rooms.get(roomId);
            const attackerUser = roomData.users.find((user: any) => user.id === socket.id);
            const targetUser = roomData.users.find((user: any) => user.id === targetId);
            const attacker = attackerUser.character;
            const target = targetUser.character;

            if (attacker && target) {
                attacker.specialMove(target);
                io.to(roomId).emit('updateHealth', { id: targetUser.id, health: target.health });
                io.to(roomId).emit('updateHealth', { id: attackerUser.id, health: attacker.health });
                io.to(roomId).emit('turn', targetUser.id);
                checkGameOver(io, roomId, attackerUser, targetUser);
            }
        });

        socket.on('gameOver', (roomId: string, winnerId: string) => {
            io.to(roomId).emit('gameOver', winnerId);
        });

        const checkGameOver = (io: SocketServer, roomId: string, attackerUser: any, targetUser: any) => {
            if (targetUser.character.health <= 0) {
                const winnerId = attackerUser.id;
                io.to(roomId).emit('gameOver', winnerId);
            } else if (attackerUser.character.health <= 0) {
                const winnerId = targetUser.id;
                io.to(roomId).emit('gameOver', winnerId);
            }
        };

        const updateRoomList = () => {
            const roomsAvailable = Array.from(rooms.keys()).filter((room) => rooms.get(room).users.length < 2);
            io.emit('rooms', roomsAvailable);
        };

        socket.on('rooms', () => {
            updateRoomList();
        });
    });

    return io;
};
