import axios from 'axios';
import React, { useEffect, useState } from 'react'
import {baseUrl} from '../constants';
import avatarImage from '../assets/avatar.png'

function ContactList({ currentUser, conversation, member, onlineStatus }) {
    const friendIds = conversation.participants?.find(memberId => memberId !== currentUser)
    const [friendsData, setFriendsData] = useState({})

    useEffect(() => {
        try {
            const getFriendInfo = async () => {
                const response = await axios.get(baseUrl + `/user/userId/${friendIds}`)
                setFriendsData(response.data);
            }
            getFriendInfo()
        }
        catch (err) {
            console.log(err);
        }
    }, [])

    return (
        <div>
            <li class="contact">
                <div class="wrap">
                    {/* online or offline */}
                    <span class={onlineStatus}></span>
                    <img src={avatarImage} alt="" />
                    <div class="meta">
                        {friendsData && <p class="name">{friendsData.name}</p>}
                        {member && <p class="name">{member.name}</p>}
                        {/* <p class="preview" style={{ fontSize: 12, color: 'lightgray' }}>You just got LITT up, Mike.</p> */}
                    </div>
                </div>
            </li>
        </div>
    )
}

export default ContactList