import { Box, ChakraProvider, HStack } from '@chakra-ui/react'
import { React, useRef, useState, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'
import LanguageSelector from './LanguageSelector'
import { CODE_SNIPPETS } from '../constants'
import Output from './Output'
import UserDisplay from './UsersDisplay'
import 'bootstrap/dist/css/bootstrap.min.css';
import Client from './client'
import { useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'
import { initSocket } from '../socket'
import toast from 'react-hot-toast'
import { throttle } from 'lodash'



const CodeEditor = () => {

    const [clients, setclients] = useState([]);
    const editorRef = useRef()
    const valueRef = useRef('');
    const [value, setvalue] = useState("");
    const [language, setlanguage] = useState('javascript')
    const codeRef = useRef(null);
    const socketRef = useRef(null)
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const init = async () => {

            socketRef.current = await initSocket();
            socketRef.current.on("connect_error", (err) => {
                handleError(err);
            })
            socketRef.current.on("connect_failed", (err) => {
                handleError(err);
            })

            const handleError = (e) => {
                console.log('socket error=>', e);
                toast.error("socket connection failed");
                navigate("/");
            }
            socketRef.current.emit('join', {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on("joined", ({ clients, username, socketId }) => {


                if (username !== location.state?.username) {
                    toast.success(`${username} joined`);

                }

                setclients(clients);

            });

            //disconnecting the users

            socketRef.current.on('disconnected', ({ socketId, username, }) => {
                toast.success(`${username} left the room`);
                setclients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                })

            })

            socketRef.current.on('code-change', ({ code }) => {
                if (editorRef.current) {
                    const currentValue = editorRef.current.getValue();
                    if (code !== currentValue) {
                        editorRef.current.setValue(code);
                        valueRef.current = code;
                    }
                }
            });

            // Sync code when a new user joins
            socketRef.current.on('sync-code', ({ code }) => {
                if (editorRef.current && code !== undefined && typeof code === 'string') {
                    // Update the editor's value and ref value if needed
                    const currentValue = editorRef.current.getValue();
                    if (code !== currentValue) {
                        editorRef.current.setValue(code);
                        valueRef.current = code;
                    }
                }
            });

            
        };

        init()

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off('join');
            socketRef.current.off('disconnected');
            socketRef.current.off('code-change');
            socketRef.current.off('sync-code');
        };

    }, [])








    if (!location.state) {
        return <Navigate to="/" />
    }

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();

        const throttledEmit = throttle((codeValue) => {
            if (socketRef.current) {
                socketRef.current.emit('code-change', {
                    roomId,
                    code: codeValue,
                });
            }
        }, 1000);

        editor.onDidChangeModelContent((event) => {
            const codeValue = editor.getValue();
            valueRef.current = codeValue
            throttledEmit(codeValue);

            const { origin } = codeValue;
            // const code = codeValue

            if (socketRef.current) {
                socketRef.current.emit('code-change', {
                    roomId,
                    code: codeValue

                })
            }

            
        });
    };

    const onSelect = (language) => {
        setlanguage(language);
        setvalue(
            CODE_SNIPPETS[language]
        )

    }

    const throttledEmit = throttle((code) => {
        socketRef.current.emit('code-change', { roomId, code });
    }, 1000);

    const onChange = (value) => {
        valueRef.current = value;
        setvalue(value);
        if (socketRef.current) {
            socketRef.current.emit('code-change', {
                roomId,
                code: value,
            });
        }

        throttledEmit(value);
    };

    const copyRoomId = async ()=>{
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('roomId is copied');
        } catch (error) {
            toast.error("ERROR")
            
        }
    }

    const leaveRoom = async ()=>{
        navigate("/");
    }

    return (
        <div className="container-fluid vh-100">
            <div className="row h-100">
                <div className="col-md-2  text-gray-200  flex flex-col h-screen m-0 p-0" style={{ boxShadow: "2px 0px 4px rgba(0,0,0,0.1)" }}>
                    <div className='font-semibold text-lg flex flex-col flex-grow'>

                        <div className='flex justify-center items-center p-1'>

                            <img width={40} className='invert' src="/logo.svg" alt="logo" />
                            <h1 className='text-white font-bold text-2xl'>CDE</h1>



                        </div>
                        <hr style={{ marginTop: "-0rem" }} />



                        <div className='flex flex-col overflow-auto custom-scrollbar'>

                            {/* client lists */}

                            {
                                clients.map((client) => (
                                    <Client key={client.socketId} username={client.username} />

                                ))
                            }

                        </div>



                        <div className='mt-auto flex flex-col p-4'>
                            <hr className='p-2' />
                            <button onClick={copyRoomId} 
                            className='mb-4 px-6 py-3 bg-[#5ac18e] text-[#0f0a19] font-semibold rounded-lg shadow-md hover:bg-[#48a178] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ac18e] transition duration-300 ease-in-out'>
                                Copy Room Id
                            </button>

                            <button onClick={leaveRoom} 
                            className=' mb-4 px-6 py-3 bg-[#f01808] text-[#0f0a19] font-semibold rounded-lg shadow-md hover:bg-[#823803] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ac18e] transition duration-300 ease-in-out'>
                                Leave Room
                            </button>

                        </div>

                    </div>


                </div>

                <div className="col-md-10 flex flex-col h-100">

                    <Box>
                        <HStack spacing={4}>
                            <Box w='50%'>

                                <LanguageSelector language={language} onSelect={onSelect} />
                                <Editor
                                    id="codeEditor"
                                    height="85vh"
                                    theme='vs-dark'
                                    language={language} defaultValue={CODE_SNIPPETS[language]}
                                    value={value}
                                    onMount={onMount}
                                    onChange={onChange}/>;


                            </Box>

                            <Output editorRef={editorRef} language={language} />
                        </HStack>


                    </Box>


                </div>
            </div>

        </div>




    )
}

export default CodeEditor
