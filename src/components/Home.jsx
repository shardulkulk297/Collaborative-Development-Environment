import {React, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {v4 as uuid} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const [roomId, setroomId] = useState("");
  const [username, setusername] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setroomId(e.target.value);
    
  }
  

  const generateRoomId = (e) => {

    e.preventDefault();
    const id = uuid();
    setroomId(id);
    toast.success("Room Id is Generated Successfully")

    
  }

  const joinRoom = () => {

    if(!roomId || !username){
      toast.error("Both the fields should be filled");
      return;

    }
    navigate(`/Editor/${roomId}`, {
      state: {username},
    });

    toast.success("Room is created");

    
  }
  
  
  return (

    <div className="container-fluid ">
      <div className="row flex justify-center items-center min-vh-100 min-h-screen">


        <div className='col-12 col-md-6'>
          <div className="card shadow-sm p-2 mb-5 bg-secondry rounded">
            <div className="p-10 card-body text-center border-2 border-[#9a86d4] rounded-3xl ">

              <div className='flex justify-center items-center p-10'>

                <img width={60} className='invert' src="logo.svg" alt="logo" /> <h1 className='text-white font-bold text-3xl'>CDE</h1>


              </div>
              <h4 className='text-white p-2'>Enter Room Id</h4>
              <div className="form-group">

                <input value={roomId} onChange={handleChange}  type="text" className='form-control mb-2 block w-full px-4 py-2 text-white bg-[#1a1326] border border-[#9a86d4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c6b0ff] placeholder-gray-400' placeholder='Room Id' />
                
                <input
                value={username} onChange={(e) => {
                  setusername(e.target.value)
                  
                }
                }
                type="text" className='form-control mb-2 block w-full px-4 py-2 text-white bg-[#1a1326] border border-[#9a86d4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c6b0ff] placeholder-gray-400' placeholder='Username' />
              </div>

              <button
              
              onClick={joinRoom}
              className='px-6 py-3 bg-[#5ac18e] text-[#0f0a19] font-semibold rounded-lg shadow-md hover:bg-[#48a178] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ac18e] transition duration-300 ease-in-out'>Join</button>
              <p className='mt-3 text-white'>Don't have a Room Id? <span 
              className='text-green-500 cursor-pointer'
              onClick={generateRoomId}
              
              >New Room</span></p>








            </div>
          </div>

        </div>


      </div>
    </div>
  )
}

export default Home
