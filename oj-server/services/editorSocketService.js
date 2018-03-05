var redisClient = require('../module/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io) {
    //collaboration sessions
    //record all the participants in each session so that server can send changes to all cparticipants in a session
    var collaborations = {};

    // map from socketId to sessionId
    var socketId2SessionId = {};

    // each application has their own session
    var sessionPath = '/temp_session';
    
    // wait for the connection
    io.on('connection', socket => {
        let sessionId = socket.handshake.query['sessionId'];
        socketId2SessionId[socket.id] = sessionId;

        if(sessionId in collaborations){
            collaborations[sessionId]['participants'].push(socket.id);

            let participants = collaborations[sessionId]['participants'];
            for(let i = 0; i < participants.length; i++){
                io.to(participants[i]).emit('userchange', participants);
            }
        }else{
            // not in memory then check in redis
            redisClient.get(sessionPath + '/' + sessionId, function(data) {
                if(data){
                    console.log("get session data back from redis");
                    collaborations[sessionId] = {
                        'cachedInstructions': JSON.parse(data),
                        'participants': []
                    }
                }else{
                    console.log("create new session");
                    collaborations[sessionId] = {
                        'cachedInstructions': [],
                        'participants': []
                    };
                }
                collaborations[sessionId]['participants'].push(socket.id);
                io.to(socket.id).emit('userchange', socket.id);
            });
        }

        // collaborations[sessionId]['participants'].push(socket.id);

        // socket event listeners
        // delta is the change info
        // it records the row and cloumn of the changes
        socket.on('change', delta => {
            // for debugging
            console.log("change " + socketId2SessionId[socket.id] + " " + delta);

            // get session id based on socket.id
            let sessionId = socketId2SessionId[socket.id];
            if(sessionId in collaborations){
                collaborations[sessionId]['cachedInstructions'].push(['change', delta, Date.now()]);
                let participants = collaborations[sessionId]['participants'];
                // send changes to all participants
                for(let i = 0; i < participants.length; i++){
                    // skip the one who created this change
                    if(socket.id != participants[i]){
                        io.to(participants[i]).emit('change', delta);
                    }
                }
            }else{
                console.log("cound not tie socket id to any collaboration");
            }
        });

        // show all stored data
        socket.on('restoreBuffer', () => {
            let sessionId = socketId2SessionId[socket.id];
            console.log('restore buffer for session ' + sessionId + ', socket id: ' + socket.id);

            if(sessionId in collaborations){
                let instructions = collaborations[sessionId]['cachedInstructions'];
                for(let i = 0; i < instructions.length; i++){
                    socket.emit(instructions[i][0], instructions[i][1]); // change + delta
                }
            }else{
                console.log('could not find any collcation for this session');
            }
        });

        socket.on('disconnect', function(){
            let sessionId = socketId2SessionId[socket.id];
            console.log('disconnect session ' + sessionId + ', socket id: ' + socket.id);

            let foundAndRemoved = false;

            if(sessionId in collaborations){
                let participants = collaborations[sessionId]['participants'];
                let index = participants.indexOf(socket.id);

                if(index >= 0){
                    participants.splice(index, 1);
                    foundAndRemoved = true;

                    if(participants.length == 0){
                        console.log('last participant left, committing to redis and remove from memory');
                        let key = sessionPath + '/' + sessionId;
                        let value = JSON.stringify(collaborations[sessionId]['cachedInstructions']);

                        redisClient.set(key, value, redisClient.redisPrint);
                        redisClient.expire(key, TIMEOUT_IN_SECONDS);
                        delete collaborations[sessionId];
                    }
                }
                // emit the new user list 
                for(let i = 0; i < participants.length; i++){
                    io.to(participants[i]).emit('userchange', participants);
                }
            }

            if(!foundAndRemoved){
                console.log('Could not find the socket.id in collaboration');
            }
        });

        // reply to socket.id, emit 'message' event so that client side can get the message
        // io.to(socket.id).emit('message', 'here from server');
    });
}