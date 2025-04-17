import React from 'react'
import { Link } from "react-router-dom"
const Chat = ()=>{
    return(
        <>
        <p>CHAT PAGE</p>
        <Link to="/"><button className='login'>back</button></Link>
        </>
    )
}
export default Chat