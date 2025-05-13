import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createBrowserRouter, RouterProvider} from "react-router-dom"
import LogIn from './LOGIN/LogIn'

import Conversation from './CHAT/Conversation'

import Customer from './LOGIN/Customer'
import Seller from './LOGIN/Seller'

import Payment from './CUSTOMER/Payment'
import Delivery from './SELLER/Delivery'
import Offer from './SELLER/Offer'
import Announce from './CUSTOMER/Announce'


import FrontPage from './CUSTOMER/FrontPage'
import CustomerProfile from './CUSTOMER/CustomerProfile'
import Details from "./CUSTOMER/Details"
import Bill from './CUSTOMER/Bill'
import Compare from './CUSTOMER/Compare'

import HomePage from './SELLER/HomePage'
import SellerProfile from './SELLER/SellerProfile'
import InsertBook from './SELLER/InsertBook'
import AllBooks from './SELLER/AllBooks'
import CustomerInformation from './SELLER/CustomerInformation'
function App() {
  const [username, setUsername] = useState("");
  const router = createBrowserRouter(
    [
      {path: "/", element: <><LogIn /></>},

      

      {path: "/customer", element: <Customer setUsername={setUsername} />},
      {path: "/seller", element: <><Seller /></>},


      {path: "/frontpage", element: <FrontPage username={username} />},
      {path: "/homepage", element: <><HomePage /></>},
      
      {path: "/customerprofile", element: <><CustomerProfile /></>},
      {path: "/sellerprofile", element: <><SellerProfile /></>},

      {path: "/messages", element: <><Conversation /></>},
      
      {path: "/books", element: <><Details /></>},

      {path: "/purchase", element: <><Bill /></>},
      {path: "/information", element: <><Compare /></>},
      {path: "/insert", element: <><InsertBook /></>},
      {path: "/allbooks", element: <><AllBooks /></>},
      {path: "/payments", element: <><Payment/></>},
      {path: "/delivery", element: <><Delivery/></>},
      {path: "/offer", element: <><Offer/></>},
      {path: "/announce", element:<><Announce/></>},
      {path: "/customerinformation", element: <><CustomerInformation /></>},
    ]
  )




  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
