import { Box } from '@chakra-ui/react'
import { React, useRef, useState } from 'react'
import { Editor } from '@monaco-editor/react'

const CodeEditor = () => {
    const editorRef = useRef()
    const [value, setvalue] = useState("");

    const onMount = (editor)=>{
        editorRef.current = editor;
        editor.focus();

    }
  return (
    <Box>
        <Editor height="75vh" 
        theme='vs-dark'
        defaultLanguage="javascript" defaultValue="// some comment"
        value={value}
        onMount = {onMount}
        onChange={
            (value) => {
                setvalue(value)
              
            }

            
        } />;

        
    </Box>
  )
}

export default CodeEditor
