// App.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Flex,
  Image,
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
  Checkbox,
  Link,
  VStack,
  useToast,
  Icon,
  Container,
  Divider,
  Card,
  CardBody,
  HStack,
  Center
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon, } from '@chakra-ui/icons';
// import { FaShieldAlt } from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const BACKEND_API = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const [loading, setLoading] = useState({
    departments: false,
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Django REST API Login Endpoint
      const response = await fetch(`${BACKEND_API}/api/token/`, { // Or your Django auth endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token data (access and refresh tokens)
      const tokenData = {
        access: data.access || data.token,
        refresh: data.refresh || null,
      };

      // localStorage.setItem("access", res.data.access);
      // localStorage.setItem("refresh", res.data.refresh);
      const accessToken = tokenData.access;
       console.log(data);
      // Fetch user details with the token
      const userResponse = await api.get('/api/me/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      

      const userData = userResponse.data;
       console.log(userData);
      
      // Create complete user object with token
      const completeUserData = {
        ...userData,
        token: tokenData,
        email: email,
      };

      // Show success message
      toast({
        title: 'Login successful!',
        description: `Welcome back, ${userData.first_name || email.split('@')[0]}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Redirect based on role
      redirectBasedOnRole(userData.role, completeUserData);

    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      
      // Reset form
      setEmail('');
      setPassword('');
      
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } 
    // else if (password.length < 6) {
    //   newErrors.password = 'Password must be at least 6 characters';
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
   
  // Function to handle role-based redirection
  const redirectBasedOnRole = (role, userData) => {
    // Use the login function from AuthContext
    login(userData.token.access, userData.token.refresh || '', userData, rememberMe);

    // Redirect based on role
    switch (role) {
      case 'superadmin':
        navigate('/users');
        toast({
          title: 'Welcome Super Admin!',
          description: 'Redirecting to User Management',
          status: 'success',
          duration: 2000,
        });
        break;
      
      case 'org_admin':
        navigate('/dashboard');
        toast({
          title: 'Welcome Admin!',
          description: 'Redirecting to User Management',
          status: 'success',
          duration: 2000,
        });
        break;
      
      case 'unit_admin':
        navigate('/dashboard');
        toast({
          title: 'Welcome Unit Admin!',
          description: 'Redirecting to Dashboard',
          status: 'success',
          duration: 2000,
        });
        break;
      
      case 'user':
        navigate('/dashboard');
        toast({
          title: 'Welcome User!',
          description: 'Redirecting to Dashboard',
          status: 'success',
          duration: 2000,
        });
        break;
      
      case 'viewer':
        navigate('/dashboard');
        toast({
          title: 'Welcome Viewer!',
          description: 'Redirecting to Dashboard',
          status: 'success',
          duration: 2000,
        });
        break;
      
      default:
        navigate('/dashboard');
        toast({
          title: 'Welcome!',
          description: 'Redirecting to Dashboard',
          status: 'success',
          duration: 2000,
        });
        break;
    }
  };

  

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email to reset password',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Call Django REST API for password reset
    fetch(`${BACKEND_API}/api/auth/forgot-password/`, { // Your password reset endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email }),
    })
    .then(response => {
      if (response.ok) {
        toast({
          title: 'Password reset email sent',
          description: `Instructions sent to ${email}`,
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to send reset email');
      }
    })
    .catch(error => {
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const handleContactSupport = () => {
    toast({
      title: 'Contact Support',
      description: 'Redirecting to support page...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
    
    // You can navigate to support page or open modal
    // navigate('/support');
  };

  return (
    <Flex
      minH="100vh"
      width="100%"
      align="center"
      justify="center"
      bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      px={{ base: 4, sm: 6, md: 8 }}
      py={{ base: 4, md: 0 }}
    >
      <Card 
        variant="outline" 
        borderWidth="1px" 
        borderColor="gray.200"
        boxShadow={{ base: "md", md: "2xl" }}
        rounded={{ base: "lg", md: "2xl" }}
        width={{ base: "100%", sm: "95%", md: "450px" }}
        maxW="100%"
      >
        <CardBody p={{ base: 5, sm: 6, md: 8 }}>
          <VStack spacing={{ base: 5, sm: 6, md: 7 }} align="stretch">
            {/* Header */}
            <Center>
              <Image
                src='assetcore1.png'
                h={{ base: "50px", md: "60px" }}
                objectFit="contain"
              />
            </Center>

            {/* Title */}
            <VStack spacing={1} align="center">
              <Heading 
                size={{ base: "md", md: "lg" }} 
                color="gray.800"
                textAlign="center"
              >
                Welcome Back
              </Heading>
              <Text 
                fontSize={{ base: "sm", md: "md" }} 
                color="gray.600"
                textAlign="center"
              >
                Sign in to your account
              </Text>
            </VStack>

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={{ base: 5, md: 6 }} w="full">
                {/* Email Input */}
                <FormControl isInvalid={!!errors.email} w="full">
                  <FormLabel 
                    fontSize={{ base: "xs", md: "sm" }} 
                    fontWeight="medium" 
                    color="gray.700"
                  >
                    Email Address
                  </FormLabel>
                  <InputGroup size={{ base: "md", md: "lg" }}>
                    <InputLeftElement 
                      pointerEvents="none" 
                      children={<EmailIcon color="gray.400" />}
                    />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      focusBorderColor="blue.500"
                      borderColor="gray.300"
                      pl={10}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{ borderColor: 'gray.400' }}
                    />
                  </InputGroup>
                  <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>
                    {errors.email}
                  </FormErrorMessage>
                </FormControl>

                {/* Password Input */}
                <FormControl isInvalid={!!errors.password} w="full">
                  <FormLabel 
                    fontSize={{ base: "xs", md: "sm" }} 
                    fontWeight="medium" 
                    color="gray.700"
                  >
                    Password
                  </FormLabel>
                  <InputGroup size={{ base: "md", md: "lg" }}>
                    <InputLeftElement 
                      pointerEvents="none"
                      children={<LockIcon color="gray.400" />}
                    />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      focusBorderColor="blue.500"
                      borderColor="gray.300"
                      pl={10}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{ borderColor: 'gray.400' }}
                      pr={10}
                    />
                    <InputRightElement>
                      <Icon 
                        as={showPassword ? ViewOffIcon : ViewIcon}
                        color="gray.400"
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        _hover={{ color: 'gray.600' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>
                    {errors.password}
                  </FormErrorMessage>
                </FormControl>

                {/* Remember Me & Forgot Password */}
                <Flex 
                  justify="space-between" 
                  align={{ base: "flex-start", sm: "center" }}
                  w="full"
                  flexDirection={{ base: 'column', sm: 'row' }}
                  gap={{ base: 3, sm: 0 }}
                >
                  <Checkbox
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    colorScheme="blue"
                    size={{ base: "sm", md: "md" }}
                  >
                    <Text fontSize={{ base: "xs", md: "sm" }}>Remember me</Text>
                  </Checkbox>
                  
                  <Button
                    variant="link"
                    colorScheme="blue"
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="medium"
                    onClick={handleForgotPassword}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Forgot password?
                  </Button>
                </Flex>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size={{ base: "md", md: "lg" }}
                  fontSize={{ base: "sm", md: "md" }}
                  w="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: { base: 'none', md: 'translateY(-2px)' },
                    boxShadow: { base: 'md', md: 'lg' }
                  }}
                  transition="all 0.3s"
                  mt={{ base: 1, md: 2 }}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default LoginPage;