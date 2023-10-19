import React, { useEffect, useState } from 'react'
import ContactList from './ContactList'
import Messages from './Messages'
import axios from 'axios'
import { baseUrl, socketUrl } from '../constants'
import io from 'socket.io-client'
import avatarImage from '../assets/avatar.png'

function ChatScreen() {
    const userName = localStorage.getItem('userName')
    const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId')) //set userId based on login
    const [conversations, setConversations] = useState([])
    const [allMembers, setAllMembers] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [arrivedMessage, setArrivedMessage] = useState(null)
    const [newMessage, setNewMessage] = useState('')
    const [searchKey, setSearchKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [clickedFriendId, setClickedFriendId] = useState('')
    const [clickedFriendName, setClickedFriendName] = useState('')
    const [onlineUsersIdsArray, setOnlineUsersIdsArray] = useState([])
    const [onlineStatus, setOnlineStatus] = useState('offline')
    const socket = io(socketUrl)

    useEffect(() => {
        socket.emit('addUserToLive', currentUserId)

        socket.on('getAllLiveUsers', (onlineUsers) => {
            // online userid array
            let onlineUsersIds = onlineUsers.map(user => user.userId)
            setOnlineUsersIdsArray(onlineUsersIds)
        })
    }, [currentUserId])

    useEffect(() => {
        socket.on('receiveMessage', (data) => {
            setArrivedMessage({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now()
            })
        })
    }, [])

    // live to show message on chat box if selected current chat include sender
    // lets chating A and B
    useEffect(() => {
        arrivedMessage && currentChat?.participants.includes(arrivedMessage.sender) &&
            setMessages((prevS => [...prevS, arrivedMessage]))
    }, [arrivedMessage])

    // return true if user online
    const checkOnlineStatus = (conversation) => {
        // identify friend id
        let friendId = conversation.participants.filter(id => id !== currentUserId)
        // check friendId is present in onlineUsersId state

        const check = onlineUsersIdsArray.includes(friendId[0]) //true or false
        // if check is true then return 'online' else 'offline'
        return check ? 'online' : 'offline'
    }

    useEffect(() => {
        arrivedMessage && currentChat?.participants.includes(arrivedMessage.senderId) &&
            setMessages(prev => [...prev, arrivedMessage])
    }, [arrivedMessage, currentChat])

    const getAllConversationsList = async () => {
        try {
            const response = await axios.get(baseUrl + '/chat/get-all-chat/' + `${currentUserId}`)
            setConversations(response.data);
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getAllConversationsList()
    }, [currentUserId])

    const handleCurrentChat = (conversation) => {
        setCurrentChat(conversation)
        //this for search global user and create new chat using friend id
        const clickedFriendIds = conversation.participants?.find(memberId => memberId !== currentUserId)
        setClickedFriendId(clickedFriendIds)
    }

    useEffect(() => {
        try {
            const getFriendInfo = async () => {
                const response = await axios.get(baseUrl + `/user/userId/${clickedFriendId}`)
                setClickedFriendName(response.data.name);
            }
            getFriendInfo()
        }
        catch (err) {
            console.log(err);
        }

        try {
            const getMessages = async () => {
                // based on conversationsid
                const response = await axios.get(baseUrl + `/chat/messages/${currentChat._id}`)
                setMessages(response.data.resp);
            }
            getMessages()
        }
        catch (err) {
            console.log(err);
        }
    }, [currentChat])

    // for searching all registered users 
    useEffect(() => {
        if (searchKey === '*') {
            setLoading(true)
            getAllMembers()
        }
        else if (searchKey.length > 0) {
            setLoading(true)
            setTimeout(() => {
                getAllMembers()
            }, 2000);
        }
    }, [searchKey])

    const sendMessage = () => {
        const receiverId = currentChat.participants.find(eachUserId => eachUserId !== currentUserId)

        socket.emit('sendMessage', {
            senderId: currentUserId,
            receiverId,
            text: newMessage
        })

        const newMessages = {
            conversationId: currentChat._id,
            sender: currentUserId,
            text: newMessage,
        }
        try {
            axios.post(baseUrl + `/chat/new-message`,
                {
                    conversationId: currentChat._id,
                    sender: currentUserId,
                    text: newMessage
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            setMessages([...messages, newMessages])
            setNewMessage('')
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        setSearchKey('')
    }, [conversations])

    const getAllMembers = async () => {
        const allMembers = await axios.post(baseUrl + '/chat/all-members',
            { name: searchKey },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        // remove current user from all members
        const filteredMembers = allMembers?.data.filter(eachMember => eachMember._id !== currentUserId)
        setLoading(false)

        // Create an array of IDs from the 'conversations' array participants
        let participantIds = conversations.flatMap(obj => obj.participants);

        // Filter the 'filteredMembers' array to remove objects with IDs present in 'participantIds'
        let finalFilteredMembers = filteredMembers.filter(obj => !participantIds.includes(obj._id));

        setAllMembers(finalFilteredMembers)

    }

    const startNewChat = async (member) => {
        const receiverID = member._id
        const response = await axios.post(baseUrl + '/chat/new-conversation',
            { sender: currentUserId, receiver: receiverID },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        getAllConversationsList()
    }

    return (
        <div id="frame">
            <div id="sidepanel">
                <div id="profile">
                    <div class="wrap">
                        <img id="profile-img" src={avatarImage} class="online" alt="" />
                        <p>{userName}</p>

                        <small className='logout-btn' style={{ float: 'right' }}
                            onClick={() => {
                                localStorage.clear()
                                location.href = '/'
                            }}
                        >
                            Logout
                        </small>

                        <i class="fa fa-chevron-down expand-button" aria-hidden="true"></i>
                        <div id="status-options">
                            <ul>
                                <li id="status-online" class="active"><span class="status-circle"></span> <p>Online</p></li>
                                {/* <li id="status-away"><span class="status-circle"></span> <p>Away</p></li>
                                <li id="status-busy"><span class="status-circle"></span> <p>Busy</p></li> */}
                                <li id="status-offline"><span class="status-circle"></span> <p>Offline</p></li>
                            </ul>
                        </div>
                        <div id="expanded">
                            <label for="twitter"><i class="fa fa-facebook fa-fw" aria-hidden="true"></i></label>
                            <input name="twitter" type="text" value="mikeross" />
                            <label for="twitter"><i class="fa fa-twitter fa-fw" aria-hidden="true"></i></label>
                            <input name="twitter" type="text" value="ross81" />
                            <label for="twitter"><i class="fa fa-instagram fa-fw" aria-hidden="true"></i></label>
                            <input name="twitter" type="text" value="mike.ross" />
                        </div>
                    </div>
                </div>
                <div id="search">
                    <label for=""><i class="fa fa-search" aria-hidden="true"></i></label>
                    <input type="text" placeholder="Search * to find all members or name" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} />
                </div>
                <div id="contacts">
                    {
                        loading && <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '13px', color: '#b1b1a1' }}>Searching...</p>
                    }
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {
                            conversations.map(conversation => (
                                <div onClick={() => handleCurrentChat(conversation)}>
                                    <ContactList currentUser={currentUserId} conversation={conversation} onlineStatus={checkOnlineStatus(conversation)} />
                                </div>
                            ))
                        }
                        {
                            searchKey &&
                            allMembers?.map(member => (
                                <div onClick={() => startNewChat(member)}>
                                    <ContactList currentUser={currentUserId} conversation={[]} member={member} />
                                </div>
                            ))
                        }
                    </ul>
                </div>
            </div>
            <div class="content">
                <div class="contact-profile">
                    {
                        currentChat ?
                            <>
                                <img src={avatarImage} alt="" />
                                <p>{clickedFriendName}</p>
                            </>
                            :
                            <></>
                    }
                </div>
                <div class="messages" style={{ width: 500 }}>
                    {
                        currentChat ? <Messages messages={messages} currentUser={currentUserId} /> : <Messages noMessage={true} />
                    }
                </div>
                {
                    currentChat &&
                    <div class="message-input">
                        <div class="wrap">
                            <input type="text" placeholder="Write your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button class="submit" onClick={sendMessage}>send</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default ChatScreen