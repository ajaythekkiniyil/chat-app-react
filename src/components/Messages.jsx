import React, { useEffect, useRef } from 'react'
import { format } from 'timeago.js'

function Messages({ own, noMessage, messages, currentUser }) {
    const receivedMessages = messages
    const chatRef = useRef()

    useEffect(() => {
        chatRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className='chat-box'>
            {
                noMessage ?
                    <div style={{ display: 'flex', justifyContent: 'center', color: 'gray', marginTop: '30px' }}>
                        Click contacts to start chats...
                    </div>
                    :
                    receivedMessages.map(eachMessage => {
                        const own = eachMessage.sender === currentUser
                        const floatStyle = own ? 'right' : 'left';
                        return (
                            <div>
                                <p className={own ? 'sender' : 'receiver'}>
                                    {eachMessage.text}
                                </p>
                                <small ref={chatRef} style={{ fontSize: 10, display: 'inline-block', float: floatStyle, padding: '8px 40px' }}>
                                    {format(eachMessage.createdAt)}
                                </small>
                            </div>
                        )
                    })
                }
        </div>
    )
}

export default Messages