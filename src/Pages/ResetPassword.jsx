import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  VStack,
  useToast,
  Icon,
  Card,
  CardBody,
  Center
} from '@chakra-ui/react';
import { LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const BACKEND_API = import.meta.env.VITE_API_URL;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_API}/api/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          token: token,
          new_password: newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Reset password failed');
      }

      toast({
        title: 'Password Reset Successful!',
        description: 'You can now log in with your new password.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/');

    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: 'Reset failed',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Flex
      minH="100vh"
      width="100%"
      align="center"
      justify="center"
      bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      px={4}
    >
      <Card 
        variant="outline" 
        borderWidth="1px" 
        borderColor="gray.200"
        boxShadow="2xl"
        rounded="2xl"
        width="450px"
        maxW="100%"
      >
        <CardBody p={8}>
          <VStack spacing={7} align="stretch">
            <Center>
              <Heading size="lg" color="gray.800">Reset Password</Heading>
            </Center>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={6} w="full">
                <FormControl isInvalid={!!errors.newPassword} w="full">
                  <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">New Password</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" children={<LockIcon color="gray.400" />} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      focusBorderColor="blue.500"
                      pl={10}
                    />
                    <InputRightElement>
                      <Icon 
                        as={showPassword ? ViewOffIcon : ViewIcon}
                        color="gray.400"
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword} w="full">
                  <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Confirm Password</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" children={<LockIcon color="gray.400" />} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      focusBorderColor="blue.500"
                      pl={10}
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Resetting..."
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                  transition="all 0.3s"
                >
                  Reset Password
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default ResetPassword;
