import { Server } from "socket.io";

const io = new Server(process.env.SOCKET_PORT, {
    cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

const emailJoinToSocketIdMap = new Map();
const socketIdToEmailJoinMap = new Map();

io.on('connection', socket => {
    console.log('SOCKET Connected', socket.id);

    socket.on('join:user:app', data => {
        const { email } = data;
        console.log(email);
        if(!email) return;

        emailJoinToSocketIdMap.set(email, socket.id);
        socketIdToEmailJoinMap.set(socket.id, email);
    })

    socket.on('room:join', data => {
        const { email, roomId } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(roomId).emit('user:joined', { email, id: socket.id });
        socket.join(roomId);
        io.to(socket.id).emit("room:join", data);
    });

    socket.on('room:join2', data => {
        const { email, roomId } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(roomId).emit('user:joined2', { email, id: socket.id });
        socket.join(roomId);
        io.to(socket.id).emit("room:join2", data);
    });

    socket.on('room:joinWeb', data => {
        const { email, roomId, callId } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(roomId).emit('user:joined', { email, id: socket.id });
        socket.join(roomId);
        io.to(socket.id).emit("room:joinWeb", data);
        io.to(roomId).emit('admin:joined', { email, id: socket.id });
    });

    socket.on('notify:secondUser', data => {
        const { roomId, secondUserEmailId, firstPersonUserName } = data;

        console.log('PRINTING NOTIFICATION');
        console.log(roomId, secondUserEmailId, firstPersonUserName);

        const secondUserSocketId = emailJoinToSocketIdMap.get(secondUserEmailId);
        const adminSocketId = emailToSocketIdMap.get(process.env.ANDY_DOE_ADMIN_EMAIL);

        console.log('PRINTING NOTIFICATION');
        console.log(roomId, secondUserSocketId, adminSocketId);
        
        // if(!secondUserSocketId || !adminSocketId) {
        //     io.to(socket.id).emit('error:make:call', { message: "Error while creating the call"});
        // };

        io.to(secondUserSocketId).emit(`notifyUser:call`, { roomId, from: adminSocketId, userName: firstPersonUserName });

    })

    socket.on('make:call', data => {
        const { to, offer } = data;
        io.to(to).emit('incomming:call', { from: socket.id, offer });
    });

    socket.on('call:accepted', data => {
        const {to, answer} = data;
        io.to(to).emit('call:accepted', { from: socket.id, answer });
    })

    socket.on('peer:nego:needed', data => {
        const { to, offer } = data;
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    });

    socket.on('peer:nego:done', data => {
        const { to, answer } = data;
        io.to(to).emit('peer:nego:final', { from: socket.id, answer });
    });

    // Peer 2 Sockets

    socket.on('make:call2', data => {
        const { to, offer } = data;
        console.log('make:call2', data);
        io.to(to).emit('incomming:call2', { from: socket.id, offer });
    });

    socket.on('call:accepted2', data => {
        const {to, answer} = data;
        console.log('call:accepted2', data);
        io.to(to).emit('call:accepted2', { from: socket.id, answer });
    })

    socket.on('peer:nego:needed2', data => {
        const { to, offer } = data;
        console.log('peer:nego:needed2', data);
        io.to(to).emit('peer:nego:needed2', { from: socket.id, offer });
    });

    socket.on('peer:nego:done2', data => {
        const { to, answer } = data;
        console.log('peer:nego:done2', data);
        io.to(to).emit('peer:nego:final2', { from: socket.id, answer });
    });

    socket.on('admin:ended:call', data => {
        const { to } = data;
        console.log('SOCKET ID TO END ', to);
        io.to(to).emit('admin:ended:call', { from: socket.id });
        io.to(to).emit('admin:ended:call2', { from: socket.id });
    });

    socket.on('admin:rejectedCall', data => {
        const { email } = data;
        const socketId = emailToSocketIdMap.get(email);
        console.log('SOCKET ID', socketId);
        if(!socketId) return;

        io.to(socketId).emit('admin:rejectedCall', 'Admin rejected your call');
    });

    socket.on('admin:queuedCall', data => {
        const { email } = data;
        const socketId = emailToSocketIdMap.get(email);
        console.log('SOCKET ID', socketId);
        if(!socketId) return;

        io.to(socketId).emit('admin:queuedCall', 'Admin queued your call');
    });

})