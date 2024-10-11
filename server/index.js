const express = require("express");
const app = express();
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose')
app.use(cors())

//User Authentication Code

const User = require('./models/user.model');
const jwt = require('jsonwebtoken');




mongoose.connect('mongodb://localhost:27017/CDE', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


app.use(express.json())

app.get('/hello', (requ, res) => {
    res.send('hello world')
})

app.post('/api/register', async (requ, res) => {
    try {
        const { 
            username,
            email,
            password,
             } = requ.body;
        await User.create({
            
            username,
            email,
            password,
            
        })
        res.json({ status: 'ok', user: true, message: 'Registered Successfully' })


        console.log(requ.body);


    }

    catch (err) {
        res.json({ status: 'error', error: 'Duplicate Email' })
        console.log(err);
    }

})

app.post('/api/login', async (requ, res) => {
    try {

        
       
        const { username, email, password } = requ.body;

        const user = await User.findOne({
            username,
            email,
            password
        })

        if (user) {

            const token = jwt.sign({
                
                username: user.username,
                email: user.email
            }, 'CDE@297')

            return res.json({ status: 'ok Logged In', user: token })


        }

        else {
            return res.json({ status: 'error', user: false })


        }






    }

    catch (err) {
        res.json({ status: 'error', error: 'Duplicate Email or error' })
        console.log(err);
    }

})

app.get('/api/quote', async(req, res)=>{
    const token = req.headers['x-access-token']

        try{
            const decoded = jwt.verify(token, 'CDE@297')
            const email = decoded.email
            const user = await User.findOne({email: email})

            console.log('Token Validated', email);
            res.json({status:'ok', message: 'Token successfully Validated'})
            
        }
        catch(error){
            console.log(error)
            res.json({status: 'error', error: 'Invalid Token'})
        }
})

app.post('/api/quote', async(req, res)=>{
    const token = req.headers['x-access-token']

        try{
            const decoded = jwt.verify(token, 'CDE@297')
            const email = decoded.email
            const user = await User.updateOne({email: email}, { $set: { quote: req.body.quote}})
            return {status: 'ok'}
        }
        catch(error){
            console.log(error)
            res.json({status: 'error', error: 'Invalid Token'})
        }
})


app.get('/api/get-code/:roomId', async(req, res) =>{
    const token = req.headers['x-access-token']
    const { roomId } = req.params;
    console.log(`RECEIVED REQ FOR roomId: ${roomId}`)

    try {

        const decoded = jwt.verify(token, 'CDE@297');
        const email = decoded.email;
        const user = await User.findOne({email: email});

        if(user){
            const code = user.codeSnippets.get(roomId);
            return res.json({status:'ok', code: code || ''});
        }
        else{
            res.json({status: 'error', error: 'User not found'})
        }
        
        
    } catch (error) {

        console.log(error)
        res.json({status: 'error', error: 'INVALID TOKEN'})
        
    }
})

app.post('/api/save-code', async (req, res) =>{
    console.log("REQ Received for saving the code", req.body);
    const token = req.headers['x-access-token']
    const { roomId, code } = req.body;

    try{
        const decoded = jwt.verify(token, 'CDE@297');
        const email = decoded.email;
        await User.updateOne(
            {email: email},
            {$set: { [`codeSnippets.${roomId}`]: code}}
        );

        return res.json({status: 'ok', message: 'Code Saved Successfully'});
    }

    catch(error){
        console.log(error)
        return res.json({status: 'error', error: 'INVALID TOKEN'})
    }
})

app.post('/api/save-code-on-disconnect', async (req, res) =>{
    const {roomId, code, email} = req.body;

    try{
        await user.updateOne(
            
            {email: email},
            {$set: {[`codeSnippets.${roomId}`]: code}}
        )

        res.json({status: 'ok', message:"Code saved On disconnect"});
    }

    catch(error){
        console.error("ERROR SAVING THE CODE ON DISCONNECT", error)
        res.status(500).json({status: 'error', message: 'FAILED TO SAVE THE CODE ON DISCONNECT'})
    }
})


app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}))





//User Authentication Code

//Real time user Connections
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});






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


    socket.on('join', ({ roomId, username }) => {

        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
    
        //notify to all users that new users have joined
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                username,
                socketId: socket.id,
            })
        })

        //sending the latest code to the newly joined user
        const latestCode = roomCodeMap[roomId] || '';
        
            console.log(latestCode)
            socket.emit('sync-code', {code: latestCode});

        

        






    });

    socket.on('code-change', ({ roomId, code }) => {
        console.log(`Code changed in room ${roomId}: ${code}`);
        roomCodeMap[roomId] = code;
        socket.in(roomId).emit('code-change', { code })
        // const clients = getAllConnectedClients(roomId);
        // if (clients.length > 0) {
        //     clients[0].code = code;
        // }
    });

    socket.on("sync-code", ({ socketId, code }) => {
        io.to(socketId).emit("sync-code", { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach( async (roomId) => {

            if(roomId !== socket.id){
                const username = userSocketMap[socket.id]
                const user = await User.findOne({username});

                if(user){
                    const code = roomCodeMap[roomId] || '';
                    await User.updateOne(
                        {username},
                        {$set: { [`codeSnippets.${roomId}`]: code}}
                    )
                }
            }



            socket.in(roomId).emit('disconnected', {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            })
        })

        delete userSocketMap[socket.id];
        socket.leave();
    })

    socket.on('error', (error) => {
        console.error('Socket error:', error); // Log socket errors
    });
    

    //disconnected users 



})


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('server is running'));






