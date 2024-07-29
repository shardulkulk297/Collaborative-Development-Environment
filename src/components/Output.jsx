import { Box } from '@chakra-ui/react'
import React from 'react'
import { Button, Text } from '@chakra-ui/react'

const Output = () => {
  return (
    <Box w='50%'>
        <Text mb ={2} fontSize='lg' >Output</Text>
        <Button variant = 'outline'
        colorScheme = "green"
        >Run Code</Button>

        <Box
        height='75vh'
        p={2}
        border = '1px solid'
        borderRadius={4}
        borderColor='#333'
        >
            Test
        </Box>
    
    </Box>
  )
}

export default Output
