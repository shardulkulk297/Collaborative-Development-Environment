const express = require("express");
const app = express();
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose')
app.use(cors())

//User Authentication Code

mongoose.connect('mongodb://localhost:27017/CDE')

app.use(express.json())

app.get('/hello', (requ, res) => {
    res.send('hello world')
})

app.post('/api/register', async (requ, res) => {
    try {

         await User.create({
            username: requ.body.username,
            email: requ.body.email,
            password: requ.body.password,
        })
        res.json({ status: 'ok' })
        

        console.log(requ.body);
        

    }

    catch(err){
        res.json({ status: 'error', error: 'Duplicate Email' })
        console.log(err);
    }
    
})







//User Authentication Code

//Real time user Connections
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);


// app.use(cors({
//     origin: 'https://cde-frontend.netlify.app/',
// }));


const userSocketMap = {};
const roomCodeMap = {};
const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        }
    });


}



io.on('connection', (socket) => {
    // console.log(`User connected: ${socket.id}`);

    socket.on('join', ({ roomId, username }) => {

        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        // console.log(clients);
        //notify to all users that new users have joined
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                username,
                socketId: socket.id,
            })
        })


        const latestCode = roomCodeMap[roomId] || '';  // Default to empty if no code is set
        io.to(socket.id).emit('sync-code', { code: latestCode });
        socket.to(roomId).emit('code-change', { code: latestCode });


        const [firstClient] = clients;
        if (firstClient) {
            io.to(socket.id).emit('sync-code', {
                code: firstClient.code,
            });
        }






    })

    socket.on('code-change', ({ roomId, code }) => {
        roomCodeMap[roomId] = code;
        socket.in(roomId).emit('code-change', { code })
        const clients = getAllConnectedClients(roomId);
        if (clients.length > 0) {
            clients[0].code = code;
        }
    });

    socket.on("sync-code", ({ socketId, code }) => {
        io.to(socketId).emit("sync-code", { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit('disconnected', {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            })
        })

        delete userSocketMap[socket.id];
        socket.leave();
    })

    //disconnected users 



})


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('server is running'));






