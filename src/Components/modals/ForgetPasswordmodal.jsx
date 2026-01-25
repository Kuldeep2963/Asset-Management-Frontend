// ForgotPasswordModal.jsx
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  useToast,
  Icon,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
  Progress,
  HStack,
} from '@chakra-ui/react';
import { EmailIcon, CheckCircleIcon, TimeIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaEnvelope, FaCheck, FaPaperPlane } from 'react-icons/fa';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState(1); // 1: Email input, 2: Success, 3: Loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const BACKEND_API = import.meta.env.VITE_API_URL;
  const toast = useToast();

  // Validate email
  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  // Handle password reset request
  const handleResetRequest = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    setStep(3); // Show loading state

    try {
      const response = await fetch(`${BACKEND_API}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep(2); // Show success step
        
        // Start countdown for resend button
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: 'Reset email sent',
          description: 'Check your inbox for password reset instructions',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
      setStep(1); // Go back to email input
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend email
  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_API}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Restart countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: 'Email resent',
          description: 'New reset instructions sent to your email',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to resend email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend email. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal
  const handleClose = () => {
    setEmail('');
    setStep(1);
    setError('');
    setCountdown(0);
    onClose();
  };

  // Render step 1: Email input
  const renderEmailInput = () => (
    <VStack spacing={{base:6,md:4}}>
      <Center>
        <Box
          w="50px"
          h="50px"
          bg="blue.50"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={FaEnvelope} boxSize={8} color="blue.500" />
        </Box>
      </Center>

      <VStack spacing={2} textAlign="center">
        <Heading size="md">Forgot Password?</Heading>
        <Text color="gray.600" fontSize="sm">
          Enter your email address and we'll send you password reset link to reset your password.
        </Text>
      </VStack>

      <FormControl isInvalid={!!error}>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
          Email Address
        </FormLabel>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none">
            <EmailIcon color="gray.400" />
          </InputLeftElement>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter your email"
            focusBorderColor="blue.500"
            borderColor="gray.300"
            pl={10}
            _hover={{ borderColor: 'gray.400' }}
            autoFocus
          />
        </InputGroup>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>

      <Alert status="info" variant="subtle" borderRadius="md" fontSize="sm">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Important</AlertTitle>
          <AlertDescription fontSize="xs">
            You will receive an email with a link to reset your password. The link expires in 1 hour.
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );

  // Render step 2: Success message
  const renderSuccess = () => (
    <VStack spacing={6}>
      <Center>
        <Box
          w="80px"
          h="80px"
          bg="green.50"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={FaCheck} boxSize={8} color="green.500" />
        </Box>
      </Center>

      <VStack spacing={2} textAlign="center">
        <Heading size="md">Check Your Email</Heading>
        <Text color="gray.600" fontSize="sm">
          We've sent password reset instructions to:
        </Text>
        <Text fontWeight="bold" color="blue.600" fontSize="md">
          {email}
        </Text>
      </VStack>

      <Alert status="success" variant="subtle" borderRadius="md" fontSize="sm">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Email Sent Successfully</AlertTitle>
          <AlertDescription fontSize="xs">
            Please check your inbox and follow the instructions to reset your password.
          </AlertDescription>
        </Box>
      </Alert>

      <VStack spacing={3} w="full">
        <HStack spacing={2} justify="center">
          <TimeIcon color="gray.500" />
          <Text fontSize="sm" color="gray.600">
            Didn't receive the email? Check your spam folder or
          </Text>
        </HStack>
        
        <Button
          variant="outline"
          colorScheme="blue"
          onClick={handleResend}
          isLoading={isLoading}
          loadingText="Sending..."
          isDisabled={countdown > 0}
          leftIcon={<FaPaperPlane />}
          w="full"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
        </Button>
      </VStack>
    </VStack>
  );

  // Render step 3: Loading state
  const renderLoading = () => (
    <VStack spacing={6}>
      <Center>
        <CircularProgress isIndeterminate color="blue.500" size="80px" />
      </Center>

      <VStack spacing={2} textAlign="center">
        <Heading size="md">Sending Reset Instructions</Heading>
        <Text color="gray.600" fontSize="sm">
          Please wait while we process your request...
        </Text>
      </VStack>

      <Progress
        size="xs"
        isIndeterminate
        w="full"
        colorScheme="blue"
        borderRadius="full"
      />
    </VStack>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size="md"
      closeOnOverlayClick={!isLoading}
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader borderBottomWidth={1} borderColor="gray.100" pb={4}>
          <Heading size="md">Reset Password</Heading>
        </ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />

        <ModalBody py={8}>
          {step === 1 && renderEmailInput()}
          {step === 2 && renderSuccess()}
          {step === 3 && renderLoading()}
        </ModalBody>

        <ModalFooter borderTopWidth={1} borderColor="gray.100" pt={4}>
          {step === 1 && (
            <HStack spacing={3} w="full">
              <Button
                size={"sm"}
                variant="outline"
                onClick={handleClose}
                flex={1}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size={"sm"}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                onClick={handleResetRequest}
                flex={1}
                isLoading={isLoading}
                loadingText="Sending..."
                _hover={{
                  bg: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }}
                rightIcon={<ArrowForwardIcon />}
              >
                Send Reset Link
              </Button>
            </HStack>
          )}

          {step === 2 && (
            <Button
              colorScheme="blue"
              onClick={handleClose}
              w="full"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.3s"
            >
              Return to Login
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ForgotPasswordModal;