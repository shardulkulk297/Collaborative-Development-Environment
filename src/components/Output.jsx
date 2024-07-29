import { Box } from '@chakra-ui/react'
import { React, useState } from 'react'
import { Button, Text } from '@chakra-ui/react'
import CodeEditor from './CodeEditor'
import { executeCode } from '../Api'

const Output = ({editorRef, language}) => {
    const [output, setoutput] = useState(null)

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        // console.log(sourceCode);
        if(!sourceCode) return;
        try{
            const {run: result} = await executeCode(language, sourceCode)
            setoutput(result.output);

        }
        catch(error){
            console.log(error);

        }

      
    }
    
  return (
    <Box w='50%'>
        <Text mb ={2} fontSize='lg' >Output</Text>
        <Button onClick={runCode} variant = 'outline'
        colorScheme = "green" 
        >Run Code</Button>

        <Box
        height='75vh'
        p={2}
        border = '1px solid'
        borderRadius={4}
        borderColor='#333'
        >
            {output ? output : "Click run code to see the output"}
        </Box>
    
    </Box>
  )
}

export default Output
